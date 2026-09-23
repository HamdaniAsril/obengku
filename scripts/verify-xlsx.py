#!/usr/bin/env python3
"""Membaca balik berkas .xlsx hasil buildXlsx dan memeriksa isi selnya.

Butuh: python3 + openpyxl  (pip install openpyxl)

Pemakaian:
    npx vitest run            # unit test struktur
    python3 scripts/verify-xlsx.py /path/to/file.xlsx

Ini pemeriksaan semantik yang tidak bisa dicakup unit test: apakah angka 0
di depan benar-benar bertahan sebagai teks, dan apakah tipe selnya sesuai
yang diharapkan setelah dibuka oleh pembaca .xlsx nyata.
"""

import datetime
import sys

try:
    import openpyxl
except ImportError:
    sys.exit("butuh openpyxl: pip install openpyxl")


def main(path: str) -> int:
    workbook = openpyxl.load_workbook(path)
    sheet = workbook.active
    print(f"sheet = {sheet.title}  dims = {sheet.dimensions}")
    print(f"max_row = {sheet.max_row}  max_col = {sheet.max_column}")

    print("\nsel:")
    for row in sheet.iter_rows():
        for cell in row:
            print(f"  {cell.coordinate:4} {cell.data_type} {cell.value!r}")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(f"pemakaian: {sys.argv[0]} <file.xlsx>")
    raise SystemExit(main(sys.argv[1]))
