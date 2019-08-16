# -*- coding: utf-8 -*-
# Copyright (c) 2018, Digitalprizm and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import json
from datetime import datetime

class SalaryAllowanceProcess(Document):
	
	def val_date(self):
		sql_sal_adj=[]
		sql_sal="SELECT * FROM `tabSalary Slip Adjustment Value` where end_date between '{0}' and '{1}' or start_date between '{0}' and '{1}'".format(frappe.utils.data.add_days(self.from_date,1),frappe.utils.data.add_days(self.to_date,-1))
		# frappe.msgprint(str(sql_sal))
		sql_sal_adj = frappe.db.sql(sql_sal,as_dict=1)
		if sql_sal_adj:
			frappe.throw("There is already a data between this period")
		return sql_sal_adj


	def get_prev_data(self):
		
		validate_date=self.val_date()
		sql_sal_adj_prev=[]
		if not validate_date:
			sql_sal_adj_prev="SELECT employee__id,salary_component,value FROM `tabSalary Slip Adjustment Value` where start_date='{0}'".format(self.from_date)
			sql_sal_adj_prev=frappe.db.sql(sql_sal_adj_prev,as_dict=1)

		return sql_sal_adj_prev

	
	def salary_slip_val(self):
		sql_val_sal_slip="select employee from `tabSalary Slip` where start_date = '{0}'".format(self.from_date)
		sql_val_sal_slip=frappe.db.sql(sql_val_sal_slip,as_dict=1)
		return sql_val_sal_slip


	def get_data(self):
		emp_com_list=[]
		val=frappe.db.sql("SELECT name,employee_name,division,enroll_number FROM `tabEmployee`",as_dict=1)
		
		com=frappe.db.sql("SELECT name,salary_component_abbr FROM `tabSalary Component` where salary_slip_adjustment=1",as_dict=1)

		emp_com_list.append({'emp_detail':val,'salary_component':com})

		return emp_com_list


	def insert_sal_adj(self,emp_id,salary_component,value):

		get_data_ifexist=frappe.get_all("Salary Slip Adjustment Value", filters= { 'employee__id' : emp_id,'salary_component' : salary_component , 'payroll_period' : self.payroll_period }, fields=['name'])
		if get_data_ifexist:
			get_data_ifexist=get_data_ifexist[0]
			frappe.client.set_value("Salary Slip Adjustment Value", get_data_ifexist['name'] ,'value',value)
		else:
			if float(value)>0:
				ledg = frappe.new_doc("Salary Slip Adjustment Value")
				ledg.payroll_period = self.payroll_period
				ledg.start_date = self.from_date
				ledg.end_date = self.to_date
				ledg.employee__id = emp_id
				ledg.salary_component = salary_component
				ledg.value = value	
				ledg.insert(ignore_permissions=True)
				ledg.save()

		return 'Inserted'

	def update_sal_adj(self,sal_comp_val):
			
		validate_date=self.val_date()

		if not validate_date:
			for sal_detail in sal_comp_val:
					self.insert_sal_adj(sal_detail['emp_name'],sal_detail['comp_name'].strip(),sal_detail['comp_val'])

		return "Updated Successfully"

