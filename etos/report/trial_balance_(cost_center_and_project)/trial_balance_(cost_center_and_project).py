# Copyright (c) 2013, tbtech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from frappe import _
from etos.etos.report.common_report_file import *

def execute(filters=None):
	if not filters: filters = {}
	
	sql = "call `Accounts Report`({0},{1},{2},{3},{4},'Trial Balance',0)".format(json.dumps(filters.get('company')),json.dumps(filters.get('project')),json.dumps(filters.get('cost_center')),json.dumps(filters.get('from_date')),json.dumps(filters.get('to_date')))

	result = frappe.db.sql(sql,as_dict=True)
	columns = get_columns(result)
	data= get_values_list(result)
	
	return columns, data
