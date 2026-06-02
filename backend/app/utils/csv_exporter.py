import csv
import io
from typing import List


def generate_csv(headers: List[str], rows: List[List]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)
    return output.getvalue()
