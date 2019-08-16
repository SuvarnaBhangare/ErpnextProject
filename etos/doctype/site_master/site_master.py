# -*- coding: utf-8 -*-
# Copyright (c) 2019, avu developer and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class SiteMaster(Document):
	def on_cancel(self):
		sql = "select * from `tabEmployee Site Description` where site_name = '"+self.name+"' and docstatus != 2"
		data = frappe.db.sql(sql,as_dict=1)
		if data:
			frappe.throw("Cannot Cancel because Document is linked to Employee Site Description")
