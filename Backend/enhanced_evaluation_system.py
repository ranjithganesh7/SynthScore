import os
import json
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Gemini Configuration ---
YOUR_API_KEY = "AIzaSyDBYycUNsM4fyzVdV6n_YLg_lDbHAGHTYA" 

try:
    client = genai.Client(api_key=YOUR_API_KEY)
except Exception as e:
    # If this fails, it means the KEY ITSELF is invalid/expired.
    raise ValueError(f"Failed to initialize Gemini Client with hardcoded key. Check your key's validity. Error: {e}")
    
MODEL_NAME = "gemini-2.5-pro"

# --- Helper Functions (No Change) ---

def image_to_part(image_path: str, mime_type: str = "image/png") -> types.Part:
    """Loads a local image file and converts it to a Gemini types.Part object."""
    try:
        image = Image.open(image_path)
    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path}")
        raise

    buffer = BytesIO()
    # Save as PNG to preserve original quality, required by the problem statement (>= 300 DPI)
    image.save(buffer, format='PNG') 
    
    return types.Part.from_bytes(
        data=buffer.getvalue(),
        mime_type=mime_type
    )

def safe_gemini_call(prompt: str, contents: List[Any], schema: BaseModel) -> Dict[str, Any]:
    """Handles the API call with structured output and error handling."""
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=schema,
        temperature=0.1 # Lower temperature for deterministic grading
    )
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
            config=config
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {"error": str(e), "note": "Failed to get a valid JSON response from Gemini."}

# --- Pydantic Output Schemas (No Change) ---

class StructuredEvaluation(BaseModel):
    """Schema for objective questions (MCQ, Fill-in-the-Blank)."""
    question_id: str = Field(description="Unique identifier for the question (e.g., Q1a, Q2).")
    question_type: str = Field(description="Type of question: 'MCQ' or 'Fill-in-the-Blank'.")
    transcribed_answer: str = Field(description="The clean, OCR'd text or chosen option from the student's handwriting.")
    is_correct: bool = Field(description="True if the transcribed answer is correct.")
    marks_awarded: int = Field(description="1 if correct, 0 if incorrect or ambiguous.")
    reasoning: str = Field(description="Concise reason for the mark, including handling of minor variations or ambiguity.")
    flag_for_review: bool = Field(description="True if the handwriting is illegible or the marking is ambiguous (e.g., multiple MCQ options marked).")
    
class SubjectiveBreakdown(BaseModel):
    """Detailed breakdown for subjective questions."""
    relevance_and_accuracy: str = Field(description="Comment/Score on how well the answer matches the rubric's key points.")
    key_points_covered: List[str] = Field(description="List of the essential points from the rubric covered by the student.")
    flag_for_review: bool = Field(description="True if the handwriting is too poor to reliably transcribe or grade.")

class SubjectiveEvaluation(BaseModel):
    """Schema for subjective questions (2, 13, 15 Marks)."""
    question_id: str = Field(description="Unique identifier for the question.")
    max_marks: int = Field(description="The total marks for this question.")
    student_transcription: str = Field(description="The complete, clean transcription of the student's handwritten answer.")
    marks_awarded: int = Field(description="The final mark assigned, out of max_marks.")
    evaluation_breakdown: SubjectiveBreakdown
    reason_for_marking: str = Field(description="A clear, summary explanation showing why the final marks were awarded/deducted.")
    suggested_correct_answer: str = Field(description="A concise summary of the ideal answer for student feedback.")

class EvaluationResult(BaseModel):
    """Main wrapper for the evaluation of a single student sheet."""
    page_alignment_notes: str = Field(description="General notes on alignment and quality of the scanned sheet (e.g., 'Sheet 1 is slightly skewed but readable').")
    total_marks_raw: int
    structured_results: List[StructuredEvaluation]
    subjective_results: List[SubjectiveEvaluation]

# ... (Imports, Configurations, and Schemas remain the same) ...

def auto_grade_student_sheet(key_pages: List[str], student_pages: List[str]):
    """
    Grades a student's answer sheet (potentially multi-page) against an image-based key.

    Args:
        key_pages: A list of file paths for the scanned Answer Key pages.
        student_pages: A list of file paths for the student's scanned answer sheets.
    
    Returns:
        A dictionary containing the full, structured evaluation result.
    """
    
    print(f"Starting evaluation: {len(key_pages)} Key Pages and {len(student_pages)} Student Pages...")
    
    # 1. Initialize Multimodal Contents with instructions
    contents = [
        "You are an **Automated Educational Evaluation System**. You will receive images for both the Official Answer Key and the Student's Answers. "
        "Your role is to perform alignment, OCR, and grading from all raw image inputs. "
        "You must process all questions against the key and STRICTLY return the results in the JSON format provided.\n\n"
    ]
    
    # 2. Add Answer Key Images
    contents.append(f"--- OFFICIAL ANSWER KEY ({len(key_pages)} Pages) ---")
    for i, page_path in enumerate(key_pages):
        contents.append(f"Key Page {i+1}:")
        contents.append(image_to_part(page_path))
        
    # 3. Add Student Answer Sheet Images
    contents.append(f"\n--- SCANNED STUDENT ANSWER SHEETS ({len(student_pages)} Pages) ---")
    for i, page_path in enumerate(student_pages):
        contents.append(f"Student Sheet {i+1}:")
        contents.append(image_to_part(page_path))
        
    # 4. Define the System Prompt for Comprehensive Grading
    grading_prompt = """
    **Primary Instruction**: Grade the Student Sheets against the Official Answer Key images. 
    
    **🗣️ Multilingual Support**: Recognize, transcribe, and grade answers written in **English, Hindi, Japanese, French, German, and Spanish**. Transcription and feedback must match the student's language.
    
    **Alignment and Extraction**: 
    1. Comment on the general quality and alignment of both the Key and Student pages in the `page_alignment_notes`.
    2. **Crucially: EXTRACT the Question ID, Max Marks, Reference Answer, and Rubric directly from the Answer Key images.**
    3. Perform high-accuracy Multilingual OCR on the student's handwritten answers.

    **Grading Rules**: Use the information extracted from the Answer Key images for marking.
    
    **Output**: Return a single, complete JSON object according to the `EvaluationResult` schema for ALL questions found on the sheets. Calculate the `total_marks_raw`.
    """
    
    contents.append(grading_prompt)

    # 5. Execute the Gemini API Call
    result_dict = safe_gemini_call(
        prompt=grading_prompt, 
        contents=contents, 
        schema=EvaluationResult
    )
    
    return result_dict
# --- Example Execution Block ---

# 1. Answer Key File Paths (You need to designate files that contain the key)
# For this example, we'll assume two of your uploaded files represent the Key.
MOCK_KEY_PAGES = [
    "C:/Evaluation/data/answer_key.jpg"
]

# 2. Student Answer Sheet File Paths (The remaining files are the student's answers)
MOCK_STUDENT_PAGES = [
    "C:/Evaluation/data/answer_sheets/Answer_sheet.jpg"
]

# Check if all files exist (critical for execution)
all_files = MOCK_KEY_PAGES + MOCK_STUDENT_PAGES
for p in all_files:
    if not os.path.exists(p):
        print(f"⚠️ Warning: File not found at '{p}'. The script requires this file to be in the same directory.")

# 3. Execute the Grading
# The function call is now simplified, passing only image lists
final_evaluation = auto_grade_student_sheet(
    key_pages=MOCK_KEY_PAGES,
    student_pages=MOCK_STUDENT_PAGES
)

# 4. Output and Save the Result
print("\n" + "="*80)
print("📚 FINAL MULTILINGUAL EVALUATION REPORT (Structured JSON Output)")
print("="*80)
print(json.dumps(final_evaluation, indent=2))

# NEW CODE: Save to a file
output_filename = "evaluation_report_student_1.json"
with open(output_filename, 'w', encoding='utf-8') as f:
    json.dump(final_evaluation, f, indent=2, ensure_ascii=False) # ensure_ascii=False handles non-English characters

print(f"\n✅ Evaluation saved to {output_filename}")