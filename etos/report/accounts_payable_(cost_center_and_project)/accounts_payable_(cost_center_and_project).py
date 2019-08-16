
from __future__ import unicode_literals
import frappe
from etos.etos.report.accounts_receivable_with_project_and_cost_center import ReceivablePayableReport

def execute(filters=None):
	args = {
		"party_type": "Supplier",
		"naming_by": ["Buying Settings", "supp_master_name"],
	}
	return ReceivablePayableReport(filters).run(args)