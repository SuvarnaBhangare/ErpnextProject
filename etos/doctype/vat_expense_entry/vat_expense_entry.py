# -*- coding: utf-8 -*-
# Copyright (c) 2018, tbtech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import json

class VATExpenseEntry(Document):
	def on_submit(self):
		doc = frappe.new_doc('Journal Entry')
		doc.voucher_type = self.voucher_type
		doc.company = self.company
		doc.project = self.project
		doc.posting_date = self.posting_date
		doc.cheque_no = self.reference_number
		doc.cheque_date = self.reference_date
		doc.vat_expense_entry_id = self.name
		doc.cost_center = self.cost_center
		doc.append("accounts", {
			"account": self.credit_account,
			"credit_in_account_currency": self.credit,
			"cost_center": self.cost_center
		})
		doc.append("accounts", {
			"account": self.debit_account,
			"debit_in_account_currency": self.debit,
			"cost_center": self.cost_center
		})
		doc.append("accounts", {
			"account": self.taxable_account,
			"debit_in_account_currency": self.vat,
			"cost_center": self.cost_center
		})
		doc.insert()
		doc.submit()
		self.update({'journal_entry_link':doc.name})
		self.submit()


	def on_cancel(self):
		if self.journal_entry_link:
			cancel_doc = frappe.get_doc('Journal Entry',self.journal_entry_link)
			cancel_doc.cancel()
	
	def on_trash(self):
		if self.journal_entry_link:
			delete_doc = frappe.get_doc('Journal Entry',self.journal_entry_link)
			delete_doc.delete()