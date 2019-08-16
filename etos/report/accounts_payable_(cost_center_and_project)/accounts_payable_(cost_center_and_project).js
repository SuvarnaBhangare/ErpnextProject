// Copyright (c) 2016, tbtech and contributors
// For license information, please see license.txt
/* eslint-disable */


frappe.query_reports["Accounts Payable (Cost Center And Project)"] = {
	"filters": [
		{"fieldname":"cost_center",
		"label": __("Cost Center"),
		"fieldtype": "Link",
		"options":"Cost Center"
	},
	{"fieldname":"project",
		"label": __("Project"),
		"fieldtype": "Link",
		"options":"Project"
	},
	{ 
		"fieldname":"supplier",
		"label": __("Supplier"),
		"fieldtype": "Link",
		"options":"Supplier"
	},
	{
		"fieldname":"company",
		"label": __("Company"),
		"fieldtype": "Link",
		"options": "Company",
		"default": frappe.defaults.get_user_default("Company")
	},
	{
		"fieldname":"finance_book",
		"label": __("Finance Book"),
		"fieldtype": "Link",
		"options": "Finance Book"
	},
	
	{
		"fieldname":"supplier_group",
		"label": __("Supplier Group"),
		"fieldtype": "Link",
		"options": "Supplier Group"
	},		
	{
		"fieldname":"report_date",
		"label": __("As on Date"),
		"fieldtype": "Date",
		"default": frappe.datetime.get_today()
	},
	{
		"fieldname":"ageing_based_on",
		"label": __("Ageing Based On"),
		"fieldtype": "Select",
		"options": 'Posting Date\nDue Date\nSupplier Invoice Date',
		"default": "Posting Date"
	},
	{
		"fieldtype": "Break",
	},
	{
		"fieldname":"range1",
		"label": __("Ageing Range 1"),
		"fieldtype": "Int",
		"default": "30",
		"reqd": 1
	},
	{
		"fieldname":"range2",
		"label": __("Ageing Range 2"),
		"fieldtype": "Int",
		"default": "60",
		"reqd": 1
	},
	{
		"fieldname":"range3",
		"label": __("Ageing Range 3"),
		"fieldtype": "Int",
		"default": "90",
		"reqd": 1
	},
	{
		"fieldname":"tax_id",
		"label": __("Tax Id"),
		"fieldtype": "Data",
		"hidden": 1
	}
	

	],
	onload: function(report) {
		report.page.add_inner_button(__("Accounts Payable Summary"), function() {
			var filters = report.get_values();
			frappe.set_route('query-report', 'Accounts Payable Summary', {company: filters.company});
		});
	}
}



