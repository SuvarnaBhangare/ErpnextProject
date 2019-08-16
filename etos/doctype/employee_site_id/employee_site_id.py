# -*- coding: utf-8 -*-
# Copyright (c) 2019, avu developer and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from datetime import datetime
from frappe import _

class EmployeeSiteID(Document):
	def validate(self):
		for emp in self.get("employee_details"):
			sql = "select ESI.site_name,EC.employee_id,EC.id_no from `tabEmployee Site Child` EC left join `tabEmployee Site ID` ESI on ESI.name = EC.parent where ESI.site_name = '{0}' and EC.id_no = '{1}' and EC.employee_id='{2}' and ESI.docstatus=1 and ESI.name != '{3}'".format(self.site_name,emp.id_no,emp.employee_id,self.name)
			emp_sql= frappe.db.sql(sql,as_dict=1)
			if emp_sql:
				frappe.throw("<html>ID Number <b>" +str(emp.id_no)+ "</b> Already Assign to Employee <b>" +str(emp.employee_id)+"</b> Along With Site Name <b>" +str(self.site_name)+"</b>")

			

			

	

	def validate_date(self,emp,start = None,end = None):
		sql = "select EC.employee_id,EC.id_start_date,EC.id_expiry_date,EC.active from `tabEmployee Site Child` EC left join `tabEmployee Site ID` ED on ED.name = EC.parent where ED.site_name = '"+self.site_name+"' and EC.employee_id = '"+emp+"' and EC.active = 1 and ED.docstatus != 2 and ((EC.id_start_date between '"+start+"' and '"+end+"') or (EC.id_expiry_date between '"+start+"' and '"+end+"'))"
		data = frappe.db.sql(sql,as_dict=1)
		if data:
			return data
		else:
			return "No Data"

def update_active():
	sql = "select * from `tabEmployee Site Child` where active = 1"
	data = frappe.db.sql(sql,as_dict=1)
	now_date = datetime.now()
	if data:
		for i in data:
			emp = i['employee_id']
			doc_id = i['name']
			start_date = i['id_start_date']
			exp_date = i['id_expiry_date']
			if now_date > exp_date:
				frappe.db.sql("update `tabEmployee Site Child` set active = 0 where employee_id = '"+emp+"' and name = '"+doc_id+"'")
				frappe.db.commit()
			if now_date == start_date:
				frappe.db.sql("update `tabEmployee Site Child` set active = 1 where employee_id = '"+emp+"' and name = '"+doc_id+"'")
				frappe.db.commit()