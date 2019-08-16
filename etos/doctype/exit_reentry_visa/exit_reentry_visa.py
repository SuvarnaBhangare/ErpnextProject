
# -*- coding: utf-8 -*-
# Copyright (c) 2018, Digitalprizm and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class ExitReEntryVisa(Document):
	pass


@frappe.whitelist()
def family_members(employee_id):
	res1=frappe.db.sql("select member_name,gender,date_of_birth from`tabFamily Details` where parent = '"+employee_id+"'",  as_dict=1)
	return res1
