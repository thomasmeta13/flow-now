import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import os

# Path to the Tesseract executable
pytesseract.pytesseract.tesseract_cmd = r'/opt/homebrew/bin/tesseract'  # Update this path if needed

def pdf_to_text(pdf_path, output_txt_path):
    # Convert PDF to a list of images
    images = convert_from_path(pdf_path)
    
    # Create a temporary directory to save the images
    temp_dir = 'temp_images'
    os.makedirs(temp_dir, exist_ok=True)
    
    # Extract text from each image
    full_text = ''
    for i, image in enumerate(images):
        image_path = os.path.join(temp_dir, f'page_{i + 1}.png')
        image.save(image_path, 'PNG')
        
        # Perform OCR on the image
        text = pytesseract.image_to_string(image)
        full_text += text + '\n'
    
    # Save the extracted text to a file
    with open(output_txt_path, 'w', encoding='utf-8') as txt_file:
        txt_file.write(full_text)
    
    # Clean up temporary images
    for image_file in os.listdir(temp_dir):
        os.remove(os.path.join(temp_dir, image_file))
    os.rmdir(temp_dir)

if __name__ == '__main__':
    pdf_path = 'budd.pdf'  # Update this path to your PDF file
    output_txt_path = 'output_text.txt'  # Update this path to your desired output text file
    pdf_to_text(pdf_path, output_txt_path)
    print(f'OCR complete. Extracted text saved to {output_txt_path}')
