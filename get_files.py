import os

def list_files(directory, output_file):
    with open(output_file, 'w') as file:
        for root, _, files in os.walk(directory):
            for filename in files:
                file_path = os.path.join(root, filename)
                file.write(f"{file_path}\n")

if __name__ == "__main__":
    current_directory = os.getcwd()  # Get the current directory
    output_file = "file_paths.txt"  # Name of the output file
    list_files(current_directory, output_file)
    print(f"File paths have been saved to {output_file}")
