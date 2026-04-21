
#!/bin/bash

# Convert raw web log CSV output into the format expected by the analysis tool.
# Usage: ./logparser.sh input.csv output.csv

error_exit() {
    echo "Error: $1" >&2
    echo "Usage: $0 <input_file.csv> <output_file.csv>" >&2
    exit "$2"
}

if [ "$#" -ne 2 ]; then
    error_exit "Exactly 2 arguments required. Provide an input and output CSV filename." 1
fi

input_file="$1"
output_file="$2"

if [ ! -f "$input_file" ]; then
    error_exit "Input file '$input_file' does not exist." 2
fi

if [ ! -r "$input_file" ]; then
    error_exit "Input file '$input_file' exists but is not readable. Check permissions." 3
fi

if [ ! -s "$input_file" ]; then
    error_exit "Input file '$input_file' is empty. Nothing to process." 4
fi

if [[ "$input_file" != *.csv ]]; then
    error_exit "Input file '$input_file' must have a .csv extension." 5
fi

if [[ "$output_file" != *.csv ]]; then
    error_exit "Output file '$output_file' must have a .csv extension." 6
fi

if [ "$input_file" = "$output_file" ]; then
    error_exit "Input and output filenames must be different." 7
fi

echo "IP,Date,Method,URL,Protocol,Status" > "$output_file" \
    || error_exit "Cannot write to output file '$output_file'. Check directory permissions." 8

echo "Processing..."

awk -F',' -v outfile="$output_file" '
NR == 1 { next }

{
    ip = $1

    gsub(/^\[/, "", $2)
    sub(/:.*/, "", $2)
    date = $2

    split($3, parts, " ")
    method = parts[1]
    url = parts[2]
    protocol = parts[3]

    sub(/^\//, "", url)
    sub(/\?.*/, "", url)

    if (method == "") method = "UNKNOWN"
    if (url == "") url = "UNKNOWN"
    if (protocol == "") protocol = "UNKNOWN"

    gsub(/\r/, "", $4)
    status = $4

    print ip "," date "," method "," url "," protocol "," status >> outfile
    count++
}

END {
    print count " records processed..."
}
' "$input_file"

awk_exit=$?

if [ "$awk_exit" -ne 0 ]; then
    error_exit "awk processing failed. The output file may be incomplete." 9
fi

echo "Done. Output written to '$output_file'."
exit 0
