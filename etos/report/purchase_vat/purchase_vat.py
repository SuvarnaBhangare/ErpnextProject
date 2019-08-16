# Copyright (c) 2013, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from frappe import _

def execute(filters=None):
	if not filters: filters = {}
	
	get_sql_list = "Select `01#Invoice Date::100`,`11#Voucher Type::100`,`02#Invoice No:Dynamic Link/Voucher Type:150`,`06#Account::100`,`03#Supplier Name:Link/Supplier:200`,`04#Arabic Name::200`,`05#Supplier VAT No::150`,`07#VAT %:50`,`12#Nature::200`,`13#Cost Center:Link/Cost Center:50`,`14#Reference No::150`,`08#Total Excluding VAT:Currency:180`,`09#VAT Value:Currency:130`,`10#Total Including VAT:Currency:130`,`15#Created By::150`,`16#Expense Voucher No:Link/Expense Voucher Entry:150` from `VATReport_Purchase_GLEntry_Final` where `01#Invoice Date::100`>=ifnull({0},`01#Invoice Date::100`) and `01#Invoice Date::100`<=ifnull({1},`01#Invoice Date::100`) and `11#Voucher Type::100` = ifnull({2},`11#Voucher Type::100`) and `02#Invoice No:Dynamic Link/Voucher Type:150` = ifnull({3},`02#Invoice No:Dynamic Link/Voucher Type:150`) and ifnull(`03#Supplier Name:Link/Supplier:200`,0) = ifnull({4},ifnull(`03#Supplier Name:Link/Supplier:200`,0))  and ifnull(`13#Cost Center:Link/Cost Center:50`,0)=ifnull({5},ifnull(`13#Cost Center:Link/Cost Center:50`,0))  and company=ifnull({6},company)".format(json.dumps(filters.get('from_date')),json.dumps(filters.get('to_date')),json.dumps(filters.get('voucher_type')),json.dumps(filters.get('voucher_number')),json.dumps(filters.get('supplier_name')),json.dumps(filters.get('cost_center')),json.dumps(filters.get('company')))
	
	get_list=frappe.db.sql(get_sql_list, as_dict=1)
	
	columns = get_columns(get_list)
	data= get_values_list(get_list)
	return columns, data

# def validate_filters(filters):

# 	if (filters.get("voucher_no")
# 		and filters.get("group_by") in [_('Group by Voucher'), _('Group by Voucher (Consolidated)')]):
# 		frappe.throw(_("Can not filter based on Voucher No, if grouped by Voucher"))


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
