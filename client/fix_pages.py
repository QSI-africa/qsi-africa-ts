import os

pages_dir = 'src/pages'
for filename in os.listdir(pages_dir):
    if filename.endswith('.tsx'):
        filepath = os.path.join(pages_dir, filename)
        with open(filepath, 'r') as f:
            lines = f.readlines()
        
        # Check if the file has the corrupted ending
        # Look for the first 'export default' and truncate after it
        new_lines = []
        found_export = False
        for line in lines:
            new_lines.append(line)
            if 'export default' in line:
                found_export = True
                break
        
        if found_export:
            # Check if there's more after the first export default that we just truncated
            # If the original file had more lines, we update it
            if len(new_lines) < len(lines):
                print(f"Fixing {filename}")
                with open(filepath, 'w') as f:
                    f.writelines(new_lines)
