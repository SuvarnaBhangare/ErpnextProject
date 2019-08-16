// Copyright (c) 2016, DPI and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Purchase VAT"] = {
	"filters": [
		{
			"fieldname":"company",
			"label": __("Company"),
			"fieldtype": "Link",
			"options": "Company",
			"reqd": 1,
			"default": frappe.defaults.get_user_default("Company"),
			"on_change": function(){
				frappe.query_report.set_filter_value('cost_center','')
			}
		},
		{
			"fieldname":"from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"default":frappe.datetime.month_start(),
			"width": "50px"
	 },
 	{
			"fieldname":"to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"default":frappe.datetime.month_end(),
			"width": "50px"
	 },
	 
	 {
		"fieldname":"voucher_number",
		"label": __("Invoice No"),
		"fieldtype": "Data",
		"default":"",
		"width": "50px"
	 },
	 
	 {
		"fieldname":"supplier_name",
		"label": __("Supplier Name"),
		"fieldtype": "Link",
		"options": "Supplier",
		"width": "50px"
	 },
	 {
		"fieldname":"cost_center",
		"label": __("Cost Center"),
		"fieldtype": "Link",
		"options": "Cost Center",
		"width": "50px",
		"get_query": function(){
			
			var company = frappe.query_report.get_filter_value('company')
			if(company!=""){
				return{
					"doctype": "Cost Center",
					"filters":{
					"company":frappe.query_report.get_filter_value('company')
					}
					}
			}
			
			}
	 },
	 
	 {
		"fieldname":"voucher_type",
		"label": __("Voucher Type"),
		"fieldtype": "Select",
		"options": ' \nPurchase Invoice\nJournal Entry',
		"default":" ",
		"width": "50px"
 	}

	]
}
