# -*- coding: utf-8 -*-
# Copyright (c) 2018, tbtech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import json

class Demobilization(Document):
	# to fetech mobilized employees
	def get_allocated_emp(self):
		get_emp_sql="call get_allocated_emp_data('{0}',{1},'{2}',{3},{4},{5},{6})".format(self.company,json.dumps(self.employee),self.project,json.dumps(self.branch),json.dumps(self.division),json.dumps(self.department),json.dumps(self.designation))
		data = frappe.db.sql(get_emp_sql, as_dict=1)
		return data

	#to fetech mobilized assets
	def get_assets_data(self):
		get_asset_sql="call get_asset_mobilized_data({0},{1},{2},{3})".format(json.dumps(self.company), json.dumps(self.project), json.dumps(self.department),json.dumps(self.asset_name))
		data = frappe.db.sql(get_asset_sql, as_dict=1)
		return data
		
	#To set status of Employee and asset doctype
	def on_submit(self):
		self.status_update("Standby")
		for row in self.employee_demobilization:
			set_demobilization_date_emp = "UPDATE `tabUpload Mobilization Data` SET `end_date`={0} WHERE `name`={1}".format(json.dumps(self.demobilization_date),json.dumps(row.mob_child_id))
			frappe.db.sql(set_demobilization_date_emp)
			frappe.db.commit()

		for row in self.asset_demobilization:
			set_demobilization_date_asset = "UPDATE `tabAsset Mobilization` SET `mobilization_end_date`={0} WHERE `name`={1}".format(json.dumps(self.demobilization_date),json.dumps(row.mob_child_id))
			frappe.db.sql(set_demobilization_date_asset)
			frappe.db.commit()

	# def on_cancel(self):
	# 	self.status_update("Mobilized")
	# 	for row in self.employee_demobilization:
	# 		reset_demobilization_date_emp = "UPDATE `tabUpload Mobilization Data` SET `end_date`={0} WHERE `name`={1}".format(json.dumps(row.end_date),json.dumps(row.mob_child_id))
	# 		frappe.db.sql(reset_demobilization_date_emp)
	# 		frappe.db.commit()

	# 	for row in self.asset_demobilization:
	# 		reset_demobilization_date_asset = "UPDATE `tabAsset Mobilization` SET `mobilization_end_date`={0} WHERE `name`={1}".format(json.dumps(row.mobilization_end_date),json.dumps(row.mob_child_id))
	# 		frappe.db.sql(reset_demobilization_date_asset)
	# 		frappe.db.commit()
		
	# def emp_set_proj_status(self,name,val):
	# 	frappe.client.set_value('Employee', name, val)

	def status_update(self,status):
		demobilize = self.demobilize
		if demobilize:
			if demobilize == 'Employee':
				for row in self.employee_demobilization:
					if status=='Mobilized': 
						if row.end_date >= frappe.utils.data.nowdate():
							frappe.client.set_value('Employee', row.employee, {'project_status':status})
							# self.emp_set_proj_status(row.employee,{'project_status':status})
						else:
							frappe.throw("Mobilization end date is passed! It should be greater than current date")
					else:
						frappe.client.set_value('Employee', row.employee, {'project_status':status})
						# self.emp_set_proj_status(row.employee,{'project_status':status})
			elif demobilize == 'Asset':
				for row in self.asset_demobilization:
					if status=='Mobilized': 
						if row.mobilization_end_date >= frappe.utils.data.nowdate():
							frappe.client.set_value('Asset', row.asset_id, {'asset_status':status})
							# self.asset_set_proj_status(row.asset_id,{'asset_status':status})
						else:
							frappe.throw("Mobilization end date is passed! It should be greater than current date")
					else:
						frappe.client.set_value('Asset', row.asset_id, {'asset_status':status})
						# self.asset_set_proj_status(row.asset_id,{'asset_status':status})

	# def asset_set_proj_status(self,name,val):
	# 	frappe.client.set_value('Asset', name, val)

	# def asset_status_update(self,status):
	# 	for row in self.asset_demobilization:
	# 		if status=='Mobilized': 
	# 			if row.mobilization_end_date >= frappe.utils.data.nowdate():
	# 				self.asset_set_proj_status(row.asset_id,{'asset_status':status})
	# 			else:
	# 				frappe.throw("Mobilization end date is passed! It should be greater than current date")
	# 		else:
	# 			self.asset_set_proj_status(row.asset_id,{'asset_status':status})
