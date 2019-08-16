// Copyright (c) 2018, AVU and contributors
// For license information, please see license.txt
var set_css = function (frm) { document.querySelectorAll("[data-fieldname='get_template']")[1].backgroundColor ="#87CEFA"; }

frappe.ui.form.on('Employee Upload', {
	onload: function(frm){
		$(":contains('Get Template')").closest('button').addClass("btn-primary");
		$(":contains('Attach')").closest('button').addClass("btn-primary");
	},
	refresh: function(frm) {
		// frm.add_custom_button(__("Get Template"), function () {
		// 	window.location.href = repl(frappe.request.url +
		// 		'?cmd=%(cmd)s&company=%(company)s&branch=%(branch)s&division=%(division)s&department=%(department)s&designation=%(designation)s', {
		// 			cmd: "etos.etos.doctype.employee_upload.employee_upload.get_template",
		// 		});
		// }).addClass("btn-primary");
		// set_css(frm);
		if(!cur_frm.doc.__islocal)
		{
			$(cur_frm.fields_dict.upload_html.wrapper).empty();
		}
		else
		{
			cur_frm.trigger('upload')
		}
	},
	get_template:function() {
		window.location.href = repl(frappe.request.url +
			'?cmd=%(cmd)s&company=%(company)s&branch=%(branch)s&division=%(division)s&department=%(department)s&designation=%(designation)s', {
				cmd: "etos.etos.doctype.employee_upload.employee_upload.get_template",
			});

	},
	upload: function(){
		var $wrapper = $(cur_frm.fields_dict.upload_html.wrapper).empty();
		frappe.upload.make
		({
			parent: $wrapper,
			args: {				
				method: 'etos.etos.doctype.employee_upload.employee_upload.upload'
				},
			no_socketio: true,
			sample_url: "e.g. http://example.com/somefile.csv",
			callback: function(attachment, r) 
			{
				cur_frm.clear_table("employee_detail")
				var excel_data = r.message				
				if (excel_data){
					cur_frm.set_value('employee_detail',excel_data)
					// for(var i = 0; i<excel_data.length;i++)
					// {	
					// 	cur_frm.refresh_field("employee_detail")
					// 	var row = cur_frm.fields_dict.employee_detail.grid.add_new_row();
					// 	frappe.model.set_value(row.doctype, row.name, "employee_name",excel_data[i]['employee_name']);
					// 	frappe.model.set_value(row.doctype, row.name, "enrollment_no",excel_data[i]['enrollment_no']);
					// 	frappe.model.set_value(row.doctype, row.name, "employee_category",excel_data[i]['employee_category']);
					// 	frappe.model.set_value(row.doctype, row.name, "employment_type",excel_data[i]['employment_type']);
					// 	frappe.model.set_value(row.doctype, row.name, "iqama_no",excel_data[i]['iqama_no']);
					// 	frappe.model.set_value(row.doctype, row.name, "iqama_expiry",excel_data[i]['iqama_expiry']);
					// 	frappe.model.set_value(row.doctype, row.name, "driving_license_no",excel_data[i]['driving_license_no']);
					// 	frappe.model.set_value(row.doctype, row.name, "driving_license_expiry",excel_data[i]['driving_license_expiry']);
					// 	frappe.model.set_value(row.doctype, row.name, "baladiya_card_no",excel_data[i]['baladiya_card_no']);	
					// }
				}
				cur_frm.refresh_field("employee_detail")
			}
		})
	}
});
cur_frm.set_query("department", "employee_detail", function(doc, cdt, cdn) {
	return {
		filters: {
			company: locals[cdt][cdn].company,
		}
	};
});

frappe.ui.form.on('Employee Detail', {
	company: function(frm,cdt,cdn) {
		var child = locals[cdt][cdn]
		if (!child.company){
			child.department = ''
			cur_frm.refresh_field("employee_detail")
		}
	}
});


