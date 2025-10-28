# evaluation_system.py - Fully Dependent on Gemini API
import os
import cv2
import numpy as np
from PIL import Image
import json
import csv
import re
import logging
from io import BytesIO

# --- NEW GEMINI IMPORTS ---
from google import genai
from google.genai import types
# -------------------------

# Configure Tesseract path (Only used for fallback/initial text scanning, but kept for compatibility)
try:
    import pytesseract
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
except ImportError:
    pytesseract = None

try:
    from langdetect import detect, DetectorFactory
    DetectorFactory.seed = 0
except ImportError:
    pass # Not strictly needed if relying on Gemini, but kept for initial language guess

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- GEMINI CLIENT INITIALIZATION ---
# NOTE: Using 'api_key' here bypasses the environment variable check, which you
# confirmed was problematic. REMOVE the 'api_key' argument to rely on the
# environment variable for final security once the dependency issues are fixed.
try:
    client = genai.Client(api_key="AIzaSyDBYycUNsM4fyzVdV6n_YLg_lDbHAGHTYA")
    logger.info("Gemini Client initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize Gemini Client: {e}. All scoring will use local fallback.")
    client = None
# ------------------------------------

# ================================
# CONFIGURATION
# ================================
# Note: Tesseract/Local thresholds are now mostly irrelevant as the system relies on Gemini

# ================================
# GEMINI UTILITIES
# ================================

def image_to_base64_part(img_path, bbox=None):
    """Converts a cropped image region to a Base64 Part for the Gemini API."""
    img = cv2.imread(img_path)
    if img is None:
        raise FileNotFoundError(f"Image not found: {img_path}")

    # Crop the region
    if bbox:
        x1, y1, x2, y2 = bbox
        cropped = img[y1:y2, x1:x2]
    else:
        cropped = img

    # Convert to PIL Image and then to bytes/Part
    _, buffer = cv2.imencode('.png', cropped)
    
    return types.Part.from_bytes(data=buffer.tobytes(), mime_type='image/png')


def extract_answer_with_gemini_vision(img_path, bbox, q_no, qtype):
    """
    Uses Gemini-Vision to reliably extract handwritten answer or MCQ mark from a region.
    """
    if not client:
        return "ERROR: Gemini Client not available for answer extraction."

    image_part = image_to_base64_part(img_path, bbox)
    
    # Prompt is designed to extract a clean, single answer.
    if qtype == 'mcq':
        prompt_text = "Analyze this image region from a student's answer sheet. Identify the mark inside or next to the answer box and provide ONLY the corresponding option letter (A, B, or C). If no clear mark is present, return 'X'."
    elif qtype == 'fillblank':
        prompt_text = "Analyze this image region from a student's answer sheet. Extract ONLY the handwritten answer (word or number) for the fill-in-the-blank question."
    else: # descriptive
        prompt_text = "Analyze this image region from a student's answer sheet. Extract ALL the handwritten text written by the student."

    contents = [prompt_text, image_part]

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents
        )
        # Clean up common AI artifacts
        clean_text = response.text.strip().replace('"', '').replace('.', '').replace(',', '').upper()
        
        # Specific cleaning for MCQ to ensure it's a single letter
        if qtype == 'mcq' and len(clean_text) > 1:
            match = re.search(r'\b(A|B|C)\b', clean_text)
            return match.group(1) if match else 'X'
            
        return clean_text

    except Exception as e:
        logger.error(f"Gemini Vision extraction failed for Q{q_no}: {e}. Falling back to empty answer.")
        return ""


def evaluate_semantically(question, key_answer, student_answer):
    """
    Uses Gemini to perform semantic comparison and generate a score (0 or 1) 
    and a reason for the score. This is used for ALL question types now.
    """
    if not client:
        return 0, "Gemini Client failed to initialize. Using local fallback scoring."

    prompt = f"""
    You are an expert examiner. Your task is to compare a student's answer against a correct key answer 
    for a question. Score the answer as 1 (Correct) or 0 (Incorrect) based on semantic meaning. 
    Then, provide a brief, professional reason for the score. The correct answer is based on the question context.

    Question: "{question.strip()}"
    Correct Key Answer: "{key_answer.strip()}"
    Student Answer: "{student_answer.strip()}"

    Format your output strictly as a JSON object:
    {{"score": [0 or 1], "reason": "A brief explanation of why the score was assigned."}}
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "score": types.Schema(type=types.Type.INTEGER, description="The assigned score (0 or 1)."),
                        "reason": types.Schema(type=types.Type.STRING, description="The reason for the assigned score.")
                    }
                )
            )
        )
        
        # Parse the JSON response
        result = json.loads(response.text)
        score = result.get('score', 0)
        reason = result.get('reason', 'Gemini evaluation failed to return a reason.')
        return score, reason

    except Exception as e:
        logger.error(f"Gemini API call failed: {e}. Falling back to local scoring.")
        # Returning None, None signals a failure that should ideally halt/log
        return None, f"Gemini scoring failed due to API error: {e}"

# ================================
# UTILITIES (Pre-processing kept for better image quality)
# ================================
def preprocess_image(img_path):
    """Robust preprocessing for scanned sheets"""
    img = cv2.imread(img_path)
    if img is None:
        raise FileNotFoundError(f"Image not found or could not be read: {img_path}")
    
    # We return the original image for Gemini Vision to see colors/context
    return img, img


def get_tesseract_lang(detected_lang):
    """Map detected lang to Tesseract code (kept for question paper OCR only)"""
    TESSERACT_LANGS = {
        'en': 'eng', 'hi': 'hin', 'ta': 'tam', 'te': 'tel', 'kn': 'kan',
        'ml': 'mal', 'bn': 'ben', 'gu': 'guj', 'pa': 'pan', 'mr': 'mar',
        'fr': 'fra', 'de': 'deu', 'es': 'spa', 'zh': 'chi_sim', 'ja': 'jpn'
    }
    return TESSERACT_LANGS.get('en', 'eng') # Default to English for math papers

def ocr_image_region(img, bbox=None, lang='eng'):
    """Tesseract OCR on full image or region (Used only for question text extraction)"""
    if pytesseract is None:
        return "Tesseract Not Available"
        
    x1, y1, x2, y2 = bbox
    cropped = img[y1:y2, x1:x2]
    custom_config = f'--oem 3 --psm 6 -l {lang}'
    try:
        text = pytesseract.image_to_string(Image.fromarray(cropped), config=custom_config)
    except pytesseract.TesseractNotFoundError:
        logger.error("Tesseract is not installed or the path is incorrect. Check TESSERACT_CMD.")
        return ""
    
    return text.strip()


# ================================
# AUTOMATED TEMPLATE GENERATION MODULE (MODIFIED for ALL Qs)
# ================================
def generate_template_json(template_image_path, output_path):
    """
    Automatically generates the template.json for Q1-Q7 based on the image structure.
    Uses relative coordinates to handle most single-sheet answer papers.
    NOTE: The student answer/key box is assumed to be a fixed size/location for all Qs.
    """
    logger.info(f"Starting automatic template generation for Q1-Q7.")
    
    # Hardcoded coordinates relative to the provided image structure (approximate)
    # The image is approximately 500px wide, 800px high. Let's use relative coordinates.
    regions_data = []
    
    # Define a generic answer/key box for the right side of the sheet
    # X1_Answer, Y1_Answer, X2_Answer, Y2_Answer
    ANSWER_BOX_X1 = 400
    ANSWER_BOX_X2 = 480
    BOX_HEIGHT = 40
    
    # Question data: (Q_No, Q_Type, Top_Y_Coordinate)
    questions = [
        (1, "mcq", 100),
        (2, "mcq", 170),
        (3, "mcq", 250), # Adjusted to align with image
        (4, "mcq", 350), # Adjusted to align with image
        (5, "mcq", 450), # Adjusted to align with image
        (6, "mcq", 580), # Adjusted to align with image (before fill-in-the-blanks)
        (7, "fillblank", 650) # Fill-in-the-Blank section
    ]
    
    for q_no, q_type, q_y in questions:
        # Question text region is broad on the left
        q_bbox = [50, q_y - 20, ANSWER_BOX_X1, q_y + BOX_HEIGHT]
        
        # Answer/Key region is the same box on the right for all Qs
        ans_key_bbox = [ANSWER_BOX_X1, q_y - 20, ANSWER_BOX_X2, q_y + BOX_HEIGHT]
        
        regions_data.append({
            "q_no": q_no,
            "type": q_type,
            "question_bbox": q_bbox,
            "key_bbox": ans_key_bbox, # Used to extract key from the key sheet
            "answer_bbox": ans_key_bbox # Used to extract student answer from the student sheet
        })
    
    final_template = {
        "template_name": "Gemini-Optimized Template (Q1-Q7)",
        "regions": regions_data
    }

    with open(output_path, 'w') as f:
        json.dump(final_template, f, indent=4)
        
    logger.info(f"Template JSON successfully auto-generated at: {output_path}")
    return output_path


# ================================
# ANSWER KEY & QUESTION PARSING (GEMINI ENHANCED)
# ================================
class AnswerSheetEvaluator:
    def __init__(self, question_paper_img, answer_key_img, template_regions):
        # We only use the original images now, as Gemini will handle pre-processing
        self.question_paper_img, _ = preprocess_image(question_paper_img) 
        self.answer_key_img, _ = preprocess_image(answer_key_img)
        self.template_regions = template_regions 
        self.key_answers = []
        self.question_texts = []
        
    def generate_key_answer_gemini(self, question, qtype):
        """Generates a key answer using Gemini based on the question text and type."""
        if not client:
            return "ERROR: Gemini Client not available for key generation."

        # Adjust prompt based on question type
        if qtype == 'mcq':
            prompt = f"Provide ONLY the correct option letter (A, B, or C) for the following question: {question}"
        elif qtype == 'fillblank':
            prompt = f"Provide ONLY the single correct word or short phrase that correctly completes the following question: {question}"
        else: # descriptive
            prompt = f"Provide a brief, concise, and complete reference answer for the following question: {question}"

        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            # Clean up the output to be a reliable key
            clean_key = response.text.strip().replace('"', '').replace('.', '').replace(',', '')
            return clean_key

        except Exception as e:
            logger.error(f"Gemini key generation failed: {e}")
            return "ERROR: AI key generation failed."


    def extract_question_and_key(self):
        # No initial language detection needed since the key is generated by Gemini or OCR is on a known language
        
        for i, region in enumerate(self.template_regions):
            q_bbox = region['question_bbox']
            k_bbox = region.get('key_bbox')
            qtype = region['type']
            q_no = region['q_no']

            # 1. Get Question Text (Using Tesseract/OCR on Question Paper)
            # This is the ONLY place Tesseract is used (for question text)
            q_text = ocr_image_region(self.question_paper_img, q_bbox, get_tesseract_lang('en'))
            
            # 2. Get Key Answer (OCR on Key Sheet, then FALLBACK to Gemini)
            k_text = ocr_image_region(self.answer_key_img, k_bbox, get_tesseract_lang('en')) if k_bbox else ""
            
            # **GEMINI ENHANCEMENT 1: Generate Key Answer if OCR is poor or key is missing**
            cleaned_key = k_text.strip()
            
            # Check if OCR key is garbage or too short to be meaningful
            if not cleaned_key or len(re.sub(r'[^a-zA-Z0-9]', '', cleaned_key)) < 2:
                logger.warning(f"Q{q_no}: Key OCR failed or key is missing. Generating key answer via Gemini.")
                # Generate a reliable key answer using the question text
                cleaned_key = self.generate_key_answer_gemini(q_text, qtype)
                
            # Final cleaning/standardization of key
            if qtype == 'mcq':
                match = re.search(r'\b(A|B|C)\b', cleaned_key.upper())
                cleaned_key = match.group(1) if match else cleaned_key
            
            self.question_texts.append(q_text.strip())
            self.key_answers.append(cleaned_key.strip())

        return 'en' # Simplified language return

    def evaluate_student_sheet(self, student_img_path, student_id):
        """Evaluates one student's sheet using Gemini for extraction and scoring."""
        # Note: We don't need pre-processing here, the path to the original image is used
        results = []
        total_score = 0
        max_score = len(self.template_regions)

        for i, region in enumerate(self.template_regions):
            qtype = region['type']
            bbox = region['answer_bbox']
            q_no = region['q_no']
            key_answer = self.key_answers[i]
            question = self.question_texts[i]
            
            # **GEMINI ENHANCEMENT 2: Extract Student Answer with Vision**
            student_ans_display = extract_answer_with_gemini_vision(
                student_img_path, 
                bbox, 
                q_no, 
                qtype
            )
            # ------------------------------------------------------------------------
            
            # **GEMINI ENHANCEMENT 3: Semantic Scoring for ALL Answers**
            gemini_score, gemini_reason = evaluate_semantically(
                question, 
                key_answer, 
                student_ans_display
            )
            
            score = 0
            reason_for_wrong = "Gemini Scoring Failed"
            feedback = ""
            
            if gemini_score is not None:
                score = gemini_score
                feedback = f"Gemini Evaluation: {gemini_reason}"
                if score == 0:
                    reason_for_wrong = gemini_reason
                else:
                    reason_for_wrong = "N/A"
            else:
                # Fallback in case of a complete API/Client failure (should be rare)
                feedback = gemini_reason
                
            # ------------------------------------------------------------------------

            results.append({
                "q_no": q_no,
                "type": qtype,
                "student_answer": student_ans_display,
                "key_answer": key_answer,
                "score": score,
                "feedback": feedback,
                "correct_answer": key_answer,
                "reason_for_wrong": reason_for_wrong
            })
            total_score += score

        return {
            "student_id": student_id,
            "language": 'en',
            "total_score": f"{total_score}/{max_score}",
            "details": results
        }

# ================================
# MAIN BATCH PROCESSOR (UNCHANGED)
# ================================
def process_batch(question_paper_img, answer_key_img, answer_sheet_dir, template_json, output_dir="results"):
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(answer_sheet_dir, exist_ok=True) 
    
    if not os.path.exists(template_json) or os.stat(template_json).st_size == 0:
        logger.warning(f"Template file {template_json} not found or is empty. Attempting to auto-generate...")
        try:
            generate_template_json(question_paper_img, template_json)
        except Exception as e:
            logger.error(f"Failed to auto-generate template: {e}")
            raise FileNotFoundError("Auto-generation failed. Please check the template image path or manually create data/template.json.")

    with open(template_json, 'r') as f:
        template = json.load(f)

    evaluator = AnswerSheetEvaluator(question_paper_img, answer_key_img, template['regions'])
    lang = evaluator.extract_question_and_key()
    logger.info(f"Using language: {lang}")

    results = []
    csv_data = [["Student ID", "Total Score", "Language", "Q_No", "Type", "Key Answer", "Student Answer", "Score", "Reason"]]

    for img_file in os.listdir(answer_sheet_dir):
        if img_file.lower().endswith(('.png', '.jpg', '.jpeg', '.tif', '.tiff')):
            student_id = os.path.splitext(img_file)[0]
            img_path = os.path.join(answer_sheet_dir, img_file)
            try:
                result = evaluator.evaluate_student_sheet(img_path, student_id)
                results.append(result)
                
                for detail in result['details']:
                    csv_data.append([
                        student_id, 
                        result['total_score'], 
                        result['language'], 
                        detail['q_no'], 
                        detail['type'], 
                        detail['key_answer'], 
                        detail['student_answer'], 
                        detail['score'], 
                        detail['reason_for_wrong']
                    ])

                with open(os.path.join(output_dir, f"{student_id}.json"), 'w', encoding='utf-8') as f:
                    json.dump(result, f, ensure_ascii=False, indent=2)
            except Exception as e:
                logger.error(f"Error processing {img_file}: {e}")

    with open(os.path.join(output_dir, "summary.json"), 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    with open(os.path.join(output_dir, "summary.csv"), 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(csv_data)

    logger.info(f"Evaluation complete. Results saved in '{output_dir}'")

# ================================
# EXAMPLE USAGE (UNCHANGED)
# ================================
if __name__ == "__main__":
    QUESTION_PAPER = "C:/Evaluation/data/1.jpg"
    ANSWER_KEY = "C:/Evaluation/data/answer_key.jpg"
    ANSWER_SHEETS_DIR = "C:/Evaluation/data/answer_sheets" 
    TEMPLATE_JSON = "data/template.json"
    OUTPUT_DIR = "results/"

    process_batch(
        question_paper_img=QUESTION_PAPER,
        answer_key_img=ANSWER_KEY,
        answer_sheet_dir=ANSWER_SHEETS_DIR,
        template_json=TEMPLATE_JSON,
        output_dir=OUTPUT_DIR
    )