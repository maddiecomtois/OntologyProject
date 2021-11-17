import pandas as pd
import numpy as np

NETFLIX = 'netflix_titles/netflix_titles.csv'
DISNEY_PLUS = 'disney_plus_titles/disney_plus_titles.csv'
WALT_DISNEY = 'walt_disney/walt_disney.csv'

def add_actors(path):
    title = path.split('/')[1].split('.')[0]
    df = pd.read_csv(path)
    actors = ['ACTOR1', 'ACTOR2', 'ACTOR3', 'ACTOR4', 'ACTOR5']
    for actor in actors:
        df[actor] = [''] * len(df)

    for index, row in df.iterrows():
        if not type(row['cast']) == float:
            casts = row['cast'] \
                    .replace('[', '') \
                    .replace(']', '') \
                    .replace("'", '') \
                    .replace('"', '') \
                    .split(',')[:5]
            if len(casts) < 5:
                casts.extend([''] * (5 - len(casts)))
            for a, c in zip(actors, casts):
                df.loc[index, a] = c

    df.to_csv(f'{title}.csv')
    print(f'{title} completed')
        

if __name__ == '__main__':
    # add_actors(NETFLIX)
    # add_actors(DISNEY_PLUS)
    add_actors(WALT_DISNEY)