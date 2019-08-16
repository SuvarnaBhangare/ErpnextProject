# -*- coding: utf-8 -*-
# Copyright (c) 2018, tbtech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class EmployeeCategoryRule(Document):
	pass
	# validate and save employee as well as create new Item if manpower group exist
	# def validate(self):
		# item_group_verify = frappe.db.sql("select name, item_group_series from `tabItem Group` where name = 'Manpower'", as_dict = 1)
		# if not item_group_verify:
		# 	frappe.throw('Item Group Manpower Not Found! Please Create Item Group: Manpower')

		# check_item_exist = "select name,disabled,item_group from `tabItem` where employee_category_id = '{0}' and disabled = '{1}' and item_group = 'Manpower'".format(self.employee_category, self.is_disabled)
		# data = frappe.db.sql(check_item_exist, as_dict = 1)
		# if not data:
# 		item_doc = frappe.new_doc("Item")
# 		item_doc.item_name = self.employee_category
# 		item_doc.item_group = item_group_verify[0].name
# 		# item_doc.item_series = item_group_verify[0].item_group_series
# 		item_doc.is_stock_item = 0
# 		item_doc.disabled = self.is_disabled
# 		item_doc.stock_uom = 'Nos'
# 		item_doc.employee_category_id = self.name
# 		item_doc.save()
# 		self.item_ref = item_doc.name


# #ondelete function to delete the item after deleting employee
# @frappe.whitelist()
# def delete_item(doc,method):
# 	if doc.item_ref:
# 		item=frappe.get_doc("Item",doc.item_ref)
# 		item.delete()
# 		frappe.db.commit()
