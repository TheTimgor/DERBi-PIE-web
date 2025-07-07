import pandas as pd

index = 'id'

# Example DataFrames
old_data = pd.DataFrame({
    'id': [1, 2, 3, 4],
    'name': ['Alice', "Awawa", 'Charlie', "afdsdsa"],
    'age': [25, 30, 35, 5]
}).set_index(index)

new_data = pd.DataFrame({
    'id': [1, 3, 2],
    'name': ['Alice', 'Bobby', pd.NA],
    'age': [25, 31, 35]
}).set_index(index)

print(new_data)
print(new_data.loc[old_data.index])
