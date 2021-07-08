# https://github.com/Austyns/sqlite-to-json-python

import sqlite3, os


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

connection = sqlite3.connect("./db/product.db")
connection.row_factory = dict_factory

cursor = connection.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

#print(tables)

for table_name in tables:
    conn = sqlite3.connect("./db/product.db")
    conn.row_factory = dict_factory

    cur1 = conn.cursor()
    cur1.execute("SELECT * FROM "+table_name['name'])
    results = cur1.fetchall()

    #print(results)

    with open(table_name['name']+'.json', 'w') as the_file:
        the_file.write(format(results).replace(" u'", "'").replace("'", "\""))
connection.close()