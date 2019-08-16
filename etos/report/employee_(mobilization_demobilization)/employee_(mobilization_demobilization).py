# Copyright (c) 2013, Digitalprizm and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from frappe import _
from etos.etos.report.common_report_file import *


def execute(filters=None):
	if not filters: filters = {}
	columns=data=[]
	sql="CALL `Employee Mobilization-Demobilization Data`({0},{1},{2},{3},{4},{5},{6},{7},{8},{9});".format(json.dumps(filters.get('company')),json.dumps(filters.get('cost_center')),json.dumps(filters.get('project')),json.dumps(filters.get('employee_category')),json.dumps(filters.get('mobilization_status')),json.dumps(filters.get('employment_type')),json.dumps(filters.get('employee')),json.dumps(filters.get('task')),json.dumps(filters.get('start_date')),json.dumps(filters.get('end_date')))

	frappe.errprint(str(sql))
	result=frappe.db.sql(sql, as_dict=1)
	columns = get_columns(result)
	data= get_values_list(result)
	return columns, data



