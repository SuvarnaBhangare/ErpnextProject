// Copyright (c) 2016, DPI and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Sales VAT"] = {
	"filters": [
		{
			"fieldname":"company",
			"label": __("Company"),
			"fieldtype": "Link",
			"options": "Company",
			"default": frappe.defaults.get_user_default("Company"),
			"reqd": 1,
			"on_change": function(){
				frappe.query_report.set_filter_value('cost_center','')
			}
		},
		{
			"fieldname":"from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"default":frappe.datetime.year_start(),
			"width": "50px"
	 },
 	{
			"fieldname":"to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"default":frappe.datetime.year_end(),
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
				"company":company
						}
					}
				}
			}
	 },
 
	//  {
	// 	"fieldname":"company",
	// 	"label": __("Company"),
	// 	"fieldtype": "Link",
	// 	"options": "Company",
	// 	"default": frappe.defaults.get_user_default("Company"),
	// 	"reqd": 1
	//  },
	 
	 {
		"fieldname":"voucher_number",
		"label": __("Voucher Number"),
		"fieldtype": "Data",
		  "default":"",
		"reqd": 0,
		"width": "50px"
	 },
	 
	 {
		"fieldname":"customer_name",
		"label": __("Customer Name"),
		"fieldtype": "Link",
		"options": "Customer",
		"default":"",
		"reqd": 0,
		"width": "50px"
	 },
	 
	 {
		"fieldname":"voucher_type",
		"label": __("Voucher Type"),
		"fieldtype": "Select",
		"options": ' \nSales Invoice\nJournal Entry',
		  "default":" ",
		"reqd": 0,
		"width": "50px"
 	},

	]
}
