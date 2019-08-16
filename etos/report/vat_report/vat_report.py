# Copyright (c) 2013, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

def execute(filters=None):
	if not filters: filters = {}

  
	dict=frappe.db.sql("Select * from `VATReport_GLEntry_Final` where `01#Posting Date::100`>=(%s) and `01#Posting Date::100`<=(%s) ",(filters['from_date'],filters['to_date']) ,as_dict=1);
	
  
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
