
const fs = require('fs');

const file_path = 'c:\\Users\\Risha\\OneDrive\\Pictures\\Saved Pictures\\ai-unlocked\\ai-unlocked\\frontend\\src\\components\\SecretariatUI_temp.txt';
const out_path = 'c:\\Users\\Risha\\OneDrive\\Pictures\\Saved Pictures\\ai-unlocked\\ai-unlocked\\frontend\\src\\components\\SecretariatUI_fixed.tsx';

if (fs.existsSync(file_path)) {
    const content = fs.readFileSync(file_path, 'utf8');
    
    // Convert current utf8 text (seen as mojibake) into original bytes
    // For ISO-8859-1 (Latin1), nodes buffer from can take a string
    const buf = Buffer.from(content, 'latin1');
    const fixedContent = buf.toString('utf8');
    
    fs.writeFileSync(out_path, fixedContent, 'utf8');
    console.log("Success");
} else {
    console.log("File not found: " + file_path);
}
