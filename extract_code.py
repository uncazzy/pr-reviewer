import os
import tkinter as tk
from tkinter import filedialog, messagebox

# Function to read all the code from files in the selected directories or files
def extract_code(files_or_dirs):
    concatenated_code = ""
    for path in files_or_dirs:
        if os.path.isfile(path):
            # Add the file content
            concatenated_code += f"\n# ----- Start of file: {path} -----\n"
            with open(path, 'r', encoding='utf-8') as file:
                concatenated_code += file.read() + "\n"
            concatenated_code += f"# ----- End of file: {path} -----\n"
        elif os.path.isdir(path):
            # Recursively go through all files in the directory
            for root, _, files in os.walk(path):
                for file in files:
                    file_path = os.path.join(root, file)
                    # Add filtering for .js, .ts, and .py files
                    if file_path.endswith((".py", ".js", ".ts")):
                        concatenated_code += f"\n# ----- Start of file: {file_path} -----\n"
                        with open(file_path, 'r', encoding='utf-8') as f:
                            concatenated_code += f.read() + "\n"
                        concatenated_code += f"# ----- End of file: {file_path} -----\n"
    return concatenated_code

# Function to save the concatenated code to a file
def save_to_file(concatenated_code):
    save_path = filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("Text file", "*.txt")])
    if save_path:
        with open(save_path, 'w', encoding='utf-8') as f:
            f.write(concatenated_code)
        messagebox.showinfo("Success", "Code saved successfully!")

# Function to allow the user to select directories and files
def select_files_or_dirs():
    # Ask user to select files
    files = filedialog.askopenfilenames(title="Select Files", filetypes=[("Supported files", "*.py *.js *.ts *.html *.json *.css" ), ("All files", "*.*")])

    # Ask user to select directories
    directories = filedialog.askdirectory(title="Select Directory", mustexist=True)
    
    all_paths = list(files)  # Convert file selection to a list
    if directories:
        all_paths.append(directories)  # Add the selected directories to the list

    return all_paths

# Main GUI setup
def main():
    root = tk.Tk()
    root.title("Code Extractor")

    # Label
    label = tk.Label(root, text="Select files or directories to extract code from", font=("Helvetica", 14))
    label.pack(pady=10)

    # Button to select files or directories
    select_button = tk.Button(root, text="Select Files/Directories", command=lambda: run_extraction(root))
    select_button.pack(pady=10)

    # Exit button
    exit_button = tk.Button(root, text="Exit", command=root.quit)
    exit_button.pack(pady=10)

    root.mainloop()

# Function that handles the selection and concatenation process
def run_extraction(root):
    files_or_dirs = select_files_or_dirs()
    if files_or_dirs:
        concatenated_code = extract_code(files_or_dirs)
        if concatenated_code:
            save_to_file(concatenated_code)
        else:
            messagebox.showwarning("No code", "No code was extracted from the selected files/directories.")
    else:
        messagebox.showwarning("Selection Error", "Please select at least one file or directory.")

if __name__ == "__main__":
    main()
