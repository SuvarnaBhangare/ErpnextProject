// Copyright (c) 2016, tbtech and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Income (Cost Center And Project)"] = {
	"filters": [
		{
			"fieldname":"company",
			"label": __("Company"),
			"fieldtype": "Link",
			"options": "Company",
			"default": frappe.defaults.get_user_default("Company"),
			"reqd": 1
			
		},
		{
			"fieldname":"cost_center",
			"label": __("Cost Center"),
			"fieldtype": "Link",
			"options": "Cost Center",
			"get_query": function(){
			var company = frappe.query_report.get_filter_value('company')
				return{
				"doctype": "Cost Center",
				"filters":{
					"company":company,
					}
				}
			}
		},
		{
			"fieldname":"project",
			"label": __("Project"),
			"fieldtype": "Link",
			"options": "Project",
			"get_query": function(){
				var company = frappe.query_report.get_filter_value('company')
				return{
				"doctype": "Project",
				"filters":{
					"company":company,
					}
				}
			}	
		},
		{
			"fieldname":"from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"default":frappe.datetime.year_start(),
			
		},
		{
			"fieldname":"to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"default":frappe.datetime.year_end(),
		},
	]
}
