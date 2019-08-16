# Copyright (c) 2013, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json

def execute(filters=None):
	if not filters: filters = {}

	# sql = "Select  company as `00#company:Data:200`,* from `VATReport_Sales_GLEntry_Final` where `01#Posting Date::100`>=({0}) and `01#Posting Date::100`<=({1}) and `10#Company::100` = ifnull({2},`10#Company::100`) and `09#Voucher Type::100` = ifnull({3},`09#Voucher Type::100`) and if(`03#Customer Name:Link/Customer:200`,`03#Customer Name:Link/Customer:200`,1) = ifnull(1,Null)".format(json.dumps(filters.get('from_date')),json.dumps(filters.get('to_date')),json.dumps(filters.get('company')),json.dumps(filters.get('voucher_type')),json.dumps(filters.get('customer_name'))

	# frappe.throw(str(sql))

#   To get required fields in report  
	dict=frappe.db.sql("Select `01#Invoice Date::100`,`11#Voucher Type::100`,`02#Invoice No:Dynamic Link/Voucher Type:150`,`07#Account::100`,`08#VAT %:Int:100`,`12#Invoice Type:data:200`,`13#Reference Invoice No:Dynamic Link/Invoice Type:150`,`14#Nature::100`,`15#Reference Number::100`,`03#Customer Name:Link/Customer:200`,`04#Arabic Name::200`, `05#Customer VAT No::50`,`06#Sales Value:Currency:150`,`09#VAT Value:Currency:130`,`10#Invoice Value:Currency:130` from `VATReport_Sales_GLEntry_Final` where `01#Invoice Date::100`>=ifnull({0},`01#Invoice Date::100`) and `01#Invoice Date::100`<=ifnull({1},`01#Invoice Date::100`) and `11#Voucher Type::100` = ifnull({2},`11#Voucher Type::100`) and  ifnull(`03#Customer Name:Link/Customer:200`,0) = ifnull({3},ifnull(`03#Customer Name:Link/Customer:200`,0)) and `02#Invoice No:Dynamic Link/Voucher Type:150` = ifnull({4},`02#Invoice No:Dynamic Link/Voucher Type:150`) and ifnull(`13#Cost Center:Link/Cost Center:50`,0)=ifnull({5},ifnull(`13#Cost Center:Link/Cost Center:50`,0)) and company=ifnull({6},company)".format(json.dumps(filters.get('from_date')),json.dumps(filters.get('to_date')),json.dumps(filters.get('voucher_type')),json.dumps(filters.get('customer_name')),json.dumps(filters.get('voucher_number')),json.dumps(filters.get('cost_center')),json.dumps(filters.get('company'))), as_dict=1)

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

# def get_conditions(filters):
# 	conditions = ""
	
# 	if filters.get("company"):
# 		filters_condition = " and company = %(company)s"%(filters.get('company'))
