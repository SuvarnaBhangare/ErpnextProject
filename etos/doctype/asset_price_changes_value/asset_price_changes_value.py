# -*- coding: utf-8 -*-
# Copyright (c) 2018, tbtech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class AssetPriceChangesValue(Document):

	def get_sql(self):
		# frappe.throw(self.asset)
		sql = "SELECT modified_daily_cost AS cst, modified_daily_rate AS rt FROM `tabAsset Price Changes Value` WHERE asset = '{0}'  ORDER BY creation DESC LIMIT 1;".format(self.asset)
		sql_db = frappe.db.sql(sql,as_dict=1)

		if sql_db:
			return sql_db
		else:
			sql = "SELECT daily_cost AS cst, daily_rate AS rt FROM `tabAsset` WHERE name = '{0}'  ORDER BY creation DESC LIMIT 1;".format(self.asset)
			sql_d = frappe.db.sql(sql,as_dict=1)
			return sql_d

