# Copyright (c) 2013, tbtech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json

def execute(filters=None):
	
	if not filters: filters = {}

	get_emp_sql="call VAT_Summary_Report({0},{1},{2},{3})".format(json.dumps(filters.get('company')),json.dumps(filters.get('from_date')),json.dumps(filters.get('to_date')),json.dumps(filters.get('cost_center')))
	# frappe.throw(str(get_emp_sql))
	dict=frappe.db.sql(get_emp_sql,as_dict=1)
	
  
	columns = get_columns(dict)
	data= get_values_list(dict)
	return columns, data

def get_columns(data):
	column = []
	if len(data)!=0:
		for _key in sorted(data[0].keys()):
			_charidx = _key.find('#') + 1 if _key.find('#') > 0 else 0
			column.append(_key[_charidx:])
	return column

def get_values_list(data):
	rows = []
	if len(data)!=0:
		for idx in range(0,len(data)):
			val = []
			for _key in sorted(data[0].keys()):
				val.append(data[idx][_key])
			rows.append(val)		
	return rows
