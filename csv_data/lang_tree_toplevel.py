import pandas as pd 

df = pd.read_csv('branch_master.csv', dtype='string')
df = df.set_index('Language')

def get_top(lang):
	# print("\n############\n\n",lang)

	if int(lang['Glottologue Depth']) <= 1:
		return lang.name
	
	parent = df.loc[lang['Glottologue Tree']]
	
	if (int(lang['Glottologue Depth']) <= 2) and (parent.name != "Anatolian [anat1257]"):
		return lang.name
	
	return get_top(parent)

# print(get_top(df.loc['Champenois [cham1332]']))
result = df.apply(get_top, axis=1, result_type='reduce')
df["top_branch"] = result
print(df)
df.to_csv('branch_master.csv', encoding='utf-8-sig')