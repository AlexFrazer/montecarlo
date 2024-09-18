import os
import json

def process_and_rewrite_json_files(dir_path):
    """
    Iterates over all JSON files in a directory, parses each file, limits the array to 1000 items,
    and rewrites the file with the limited data.
    
    Args:
        dir_path (str): The path to the directory containing the JSON files.
    """
    try:
        # Get a list of files in the directory
        files = os.listdir(dir_path)
        
        # Filter for JSON files
        json_files = [file for file in files if file.endswith('.json')]

        for file in json_files:
            file_path = os.path.join(dir_path, file)

            # Open and load each JSON file
            with open(file_path, 'r', encoding='utf-8') as json_file:
                try:
                    json_data = json.load(json_file)

                    # Ensure the top level is an array
                    if isinstance(json_data, list):
                        # Limit the array to 1000 items
                        limited_data = json_data[:1000]
                        
                        # Rewriting the same file with limited data
                        with open(file_path, 'w', encoding='utf-8') as json_file:
                            json.dump(limited_data, json_file, indent=4)
                        
                        print(f"Processed and rewrote {file}")
                    else:
                        print(f"Warning: {file} does not contain an array at the top level.")
                except json.JSONDecodeError as e:
                    print(f"Error parsing {file}: {e}")
                    
    except Exception as e:
        print(f"Error processing files in directory: {e}")
        raise


# Usage example:
dir_path = './data'
process_and_rewrite_json_files(dir_path)
