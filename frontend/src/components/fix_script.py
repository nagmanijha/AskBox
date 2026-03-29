
import os

def fix_mojibake(text):
    try:
        # Step 1: Encode characters to bytes using 'latin1' / 'cp1252'
        # Step 2: Decode those bytes back as 'utf-8'
        return text.encode('latin1').decode('utf-8')
    except Exception as e:
        return text # If it fails, return as is (maybe not mojibake or not solvable this way)

file_path = r'c:\Users\Risha\OneDrive\Pictures\Saved Pictures\ai-unlocked\ai-unlocked\frontend\src\components\SecretariatUI_temp.txt'
out_path = r'c:\Users\Risha\OneDrive\Pictures\Saved Pictures\ai-unlocked\ai-unlocked\frontend\src\components\SecretariatUI_fixed.tsx'

if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We apply fix_mojibake to the whole content or specifically to literals
    # Let's try the whole content since it's common for the whole file to be messed up
    try:
        # We need to be careful. The code itself (like 'import', 'const') is fine in latin1.
        # But if the file is already encoded in UTF-8 as "characters", this should work.
        fixed_content = content.encode('iso-8859-1').decode('utf-8')
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        print("Success")
    except Exception as e:
        print(f"Error: {e}")
else:
    print(f"File {file_path} not found")
