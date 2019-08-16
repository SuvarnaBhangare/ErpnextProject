# -*- coding: utf-8 -*-
# Copyright (c) 2018, tbtech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import json

class ExpenseVoucherEntry(Document):
	def before_submit(self):
		data = self.expense_voucher_entry_table_new
		for i in data:
			doc = frappe.new_doc('Journal Entry')
			doc.voucher_type = self.voucher_type
			doc.company = i.company
			doc.company_series = i.company_series
			doc.naming_series = self.company_series +"-"+ self.current_year+"-JE-"
			doc.project = i.project
			doc.posting_date = i.voucher_date
			doc.cheque_no = i.reference_invoice_number
			doc.cheque_date = i.reference_date
			# doc.vat_expense_entry_id = self.name
			doc.doctype_reference = self.doctype
			doc.doctype_id = self.name
			doc.cost_center = i.cost_center
			doc.append("accounts", {
				"account": i.credit_account,
				"credit_in_account_currency": i.credit_amount,
				"cost_center": i.cost_center,
				"asset": i.asset,
				"project": i.project,
				"employee": i.employee,
				"party_type": i.party_type,
				"party": i.party
			})
			doc.append("accounts", {
				"account": i.expense_account,
				"debit_in_account_currency": i.expense_amount,
				"cost_center": i.cost_center,
				"asset": i.asset,
				"project": i.project,
				"employee": i.employee,
				# "party_type": i.party_type,
				# "party": i.party
			})
			if i.vat_account is not None:
				doc.append("accounts", {
					"account": i.vat_account,
					"debit_in_account_currency": i.vat_amount,
					"cost_center": i.cost_center,
					"asset": i.asset,
					"project": i.project,
					"employee": i.employee,
					# "party_type": i.party_type,
					# "party": i.party
				})
			doc.insert()
			doc.submit()
			i.reference_je_entry_id=doc.name
		self.update({'voucher_number': self.name})
	# update value of total amoount of credit, expense and vat 
	def before_update_after_submit(self):
		# for i in self.get(self.expense_voucher_entry_table_new):
		# doc = frappe.get_doc("Expense Voucher Entry",self.name)
		expens_tab = self.expense_voucher_entry_table_new
		expnse_tab_lenght=len(self.expense_voucher_entry_table_new)
		total_credit=0
		total_expense=0
		total_vat=0
		for i in range(0,expnse_tab_lenght):
			total_credit = total_credit + int(expens_tab[i].credit_amount)
			total_expense=total_expense + int(expens_tab[i].expense_amount)
			total_vat=total_vat + int(expens_tab[i].vat_amount)
		self.total_credit_amount = total_credit	
		self.total_expense_amount = total_expense
		self.total_vat_amount = total_vat
		# doc.total_credit_amount = total_credit
		# frappe.msgprint(str(doc.total_credit_amount))
		
	def on_cancel(self):
		# delete correct entry as we delet expense voucher..by suavarna
		doc = frappe.get_list("Journal Entry",filters={'doctype_id':self.name},fields=['name'],order_by='name desc')
		for i in range(0,len(doc)):
			# frappe.msgprint(doc[i]['name'])
			jv_doc = frappe.get_doc("Journal Entry",doc[i]['name'])
			jv_doc.cancel()
			jv_doc.delete()
		# for i in self.expense_voucher_entry_table_new:
		# 	if i.reference_je_entry_id:
		# 		cancel_doc = frappe.get_doc('Journal Entry',i.reference_je_entry_id)
		# 		cancel_doc.cancel()
		# 		cancel_doc.delete()

	def delete_entry(self):
		# frappe.throw('Triggered	')
		if self.journal_entry_link:
			delete_doc = frappe.get_doc('Journal Entry',self.journal_entry_link)
			delete_doc.delete()

# @frappe.whitelist()
# def update_totals(doc,method):
# 	frappe.msgprint("hiii")
			