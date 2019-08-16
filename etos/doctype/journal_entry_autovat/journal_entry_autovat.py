# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe, erpnext, json
from frappe.model.document import Document
from frappe.utils import cstr, flt, fmt_money, formatdate, getdate, nowdate, cint
from frappe import msgprint, _, scrub
from erpnext.controllers.accounts_controller import AccountsController
from erpnext.accounts.utils import get_balance_on, get_account_currency
from erpnext.accounts.party import get_party_account
from erpnext.hr.doctype.expense_claim.expense_claim import update_reimbursed_amount
from erpnext.hr.doctype.loan.loan import update_disbursement_status, update_total_amount_paid

from six import string_types, iteritems

class JournalEntryAutoVAT(Document):
	def before_submit(self):
		self.post_to_je()

	def on_cancel(self):
		if self.journal_entry_reference:
			canceller = frappe.get_doc("Journal Entry",self.journal_entry_reference)
			canceller.cancel()

	def on_trash(self):
		if self.journal_entry_reference:
			deleter = frappe.get_doc("Journal Entry",self.journal_entry_reference)
			deleter.delete()
	
	def get_rate(self):
		if self.vat_account:
			query="select tax_rate from `tabAccount` where account_type = 'Tax' and name='"+self.vat_account+"'"
			data = frappe.db.sql(query,as_dict=True)
			if data:
				return data[0]['tax_rate']

	def post_to_je(self):
		doc = frappe.new_doc("Journal Entry")
		doc.company = self.company
		doc.voucher_type = self.voucher_type
		doc.posting_date = self.posting_date
		temp = self.accounts
		doc.doctype_reference = "Journal Entry AutoVAT"
		doc.doctype_id = self.name
		doc.company_series = self.company_series
		# doc.set("accounts",self.accounts)
		doc.cheque_no = self.cheque_no
		doc.cheque_date = self.cheque_date
		# doc_accounts = doc.append("accounts")
		doc.naming_series = self.naming_series
		doc.accounts = []
		for i in temp:
			doc.append("accounts", {
					"account": i.account,
					"party_type":i.party_type,
					"party":i.party,
					"cost_center":i.cost_center,
					"exchange_rate":i.exchange_rate,
					"reference_type":i.reference_type,
					"reference_name":i.reference_name,
					"project":i.project,
					"is_advance":i.is_advance,
					"user_remark":i.user_remark,
					"credit_in_account_currency": i.credit_in_account_currency,
					"debit_in_account_currency":i.debit_in_account_currency
				})
		# accounts_list = self.get("accounts")
		# for x in range(6):
		# 	doc_accounts.account = self.accounts[x].account
		# 	doc_accounts.party_type = self.accounts[x].party_type
		# 	doc_accounts.party = self.accounts[x].party
		# 	doc_accounts.debit_in_account_currency = self.accounts[x].debit_in_account_currency
		# 	doc_accounts.credit_in_account_currency = self.accounts[x].credit_in_account_currency
		# doc.insert()
		# doc.save()
		doc.submit()
		self.journal_entry_reference = doc.name
		# self.update({'journal_entry_reference': doc.name})
		# self.submit()
