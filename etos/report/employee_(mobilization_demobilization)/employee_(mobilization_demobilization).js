// Copyright (c) 2016, tbtech and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Employee (Mobilization-Demobilization)"] = {
	"filters": [
		{
			"fieldname":"company",
			"label": __("Company"),
			"fieldtype": "Link",
			"options": "Company",
			"default": frappe.defaults.get_user_default("Company"),
			"reqd" : 1		
		},
		{
			"fieldname":"start_date",
			"label": __("Start Date"),
			"fieldtype": "Date",
			"default": frappe.datetime.month_start(),
			"reqd" : 1
			
		},
		{
			"fieldname":"end_date",
			"label": __("End Date"),
			"fieldtype": "Date",
			"default": frappe.datetime.month_end(),
			"reqd" : 1
			
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
			"fieldname":"employee_category",
			"label": __("Employee Category"),
			"fieldtype": "Link",
			"options": "Employee Category Rule"
			
		},
		// {
		// 	"fieldname":"mobilization_status",
		// 	"label": __("Mobillization Status"),
		// 	"fieldtype": "Select",
		// 	"options": "\nMobilized\nStandby"
			
		// },
		{
			"fieldname":"employment_type",
			"label": __("Employment Type"),
			"fieldtype": "Link",
			"options": "Employment Type"
			
		},
		{
			"fieldname":"employee",
			"label": __("Employee"),
			"fieldtype": "Link",
			"options": "Employee"
			
		},
		{
			"fieldname":"task",
			"label": __("Task"),
			"fieldtype": "Link",
			"options": "Task",
			"get_query": function(){
				var company = frappe.query_report.get_filter_value('company')
				return{
				"doctype": "Task",
				"filters":{
				"company":company,
				}
				}
				}
			
		},
	]
}
