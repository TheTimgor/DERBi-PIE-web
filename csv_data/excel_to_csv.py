import pandas as pd

files = ['lex_master', 'rt_master', 'rt_ref_link', 'lex_ref_link']

for fname in files:
	df = pd.read_excel(fname + '.xlsx', dtype='string')
	df.to_csv(fname + '.csv', encoding='utf-8-sig', index=False)