# Copyright (c) 2013, avu and contributors
# For license information, please see license.txt


from __future__ import unicode_literals
import frappe
import json

def execute(filters=None):
	
	if not filters: filters = {}

	get_emp_sql="select eve.company '02#Company:Link/Company:160', eve.voucher_number '03#Voucher Number:Link/Expense Voucher Entry:160', eve.voucher_date '04#Voucher Date:Data/Voucher Date:160', eve.reference_number '05#Reference Invoice Number:Data:160', eved.credit_account '07#Credit To Account:Data:160', eved.credit_amount '08#Credit Amount:Currency:160', eved.supplier '10#Supplier:Data:160', eved.expense_account '12#Expense Account:Data/Expense Account:160', eved.vat_account '13#Vat Account:Data:160', eved.vat_amount '14#VAT Amount:Currency:160',eved.reference_je_entry_id '15#Reference JE Entry ID:Link/Journal Entry:160', eved.expense_amount '16#Expense Amount:Currency:160', eved.narration '17#Narration:Data:160', eved.cost_center '18#Cost Center:Link/Cost Center:160', eved.project '19#Project:Link/Project:160', eved.asset '19#Asset:Link/Asset:160', eved.employee '20#Employee:Link/Employee:160' from `tabExpense Voucher Entry` eve inner join `tabExpense Voucher Entry Child` eved  on eve.name = eved.parent where ifnull(eve.company,0) =ifnull({0},ifnull(eve.company,0)) and eve.voucher_date>=ifnull({1},CURDATE()) and eve.voucher_date<=ifnull({2},CURDATE()) and ifnull(eve.voucher_number,0)=ifnull({3},ifnull(eve.voucher_number,0)) and ifnull(eved.supplier,0) = ifnull({4},ifnull(eved.supplier,0)) and ifnull(eved.project,0)=ifnull({5},ifnull(eved.project,0)) and ifnull(eved.cost_center,0)=ifnull({6},ifnull(eved.cost_center,0)) and ifnull(eved.employee,0)=ifnull({7},ifnull(eved.employee,0)) and ifnull(eved.reference_je_entry_id,0)=ifnull({8},ifnull(eved.reference_je_entry_id,0)) and eve.docstatus=1 order by eve.name desc ".format(json.dumps(filters.get('company')),json.dumps(filters.get('from_date')),json.dumps(filters.get('to_date')),json.dumps(filters.get('voucher_number')),json.dumps(filters.get('supplier_name')),json.dumps(filters.get('project')),json.dumps(filters.get('cost_center')),json.dumps(filters.get('employee')),json.dumps(filters.get('posted_jv_number')))
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
