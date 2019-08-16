// Copyright (c) 2018, tbtech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Demobilization', {
	//adding class to buttons on load
	onload: function (frm) {
		if (cur_frm.doc.docstatus != 1) {
			cur_frm.trigger('employee_asset_section')
		}
		
		//function to add class to a button
		var stop_loop = setInterval(()=>{
			$(":contains('Get Employee')").closest('button').addClass("btn-primary");
			$(":contains('Get Equipment')").closest('button').addClass("btn-primary");
			if($(":contains('Get Employee')").closest('button').hasClass("btn-primary") || $(":contains('Get Equipment')").closest('button').hasClass("btn-primary")){
				clearInterval(stop_loop)
			}
		},100)//end function
	},//end

	refresh: function (frm) {
		// if(cur_frm.doc.docstatus != 1) {
		// 	cur_frm.trigger('employee_asset_section')
		// }
		$(":contains('Cancel')").closest('button').hide()
	},

	//to check if records from the table are selected on save
	validate: function (frm) {
		if (cur_frm.doc.demobilization_date != undefined) {
 			if(cur_frm.doc.demobilization_date >= frappe.datetime.get_today()){
				if (cur_frm.doc.demobilize == 'Employee') {
					if (cur_frm.doc.employee_demobilization) {
						if (cur_frm.fields_dict.employee_demobilization.grid.get_selected().length > 0) {
							cur_frm.set_df_property('employee_demobilization', 'read_only', 0)
							refresh_field("employee_demobilization")
							for (var i = cur_frm.doc.employee_demobilization.length - 1; i >= 0; i--) {
								if (cur_frm.doc.employee_demobilization[i].__checked != 1) {
									cur_frm.fields_dict.employee_demobilization.grid.get_row(i).remove()
								}
							}
							var data = cur_frm.doc.employee_demobilization
							for (var i = 0; i < data.length; i++) {
								if (cur_frm.doc.demobilization_date < data[i].start_date || cur_frm.doc.demobilization_date > data[i].end_date) {
									if (cur_frm.doc.employee_demobilization[i].__checked == 1) {
										cur_frm.set_df_property('employee_demobilization', 'read_only', 1)
										frappe.throw(`Demobilization Date Cannot Be Lesser Than Mobilization Start Date or Greater Than Mobilization End Date For Employee ${data[i].employee}`)
									}
								}
							}
							cur_frm.set_df_property('employee_demobilization', 'read_only', 1)
							refresh_field("employee_demobilization")
						}
						else {
							frappe.throw("Please Select Some Records")
						}
					} else {
						frappe.throw("No Mobilized Entry Found")
					}
				}
				else if (cur_frm.doc.demobilize == 'Asset') {
					if (cur_frm.doc.asset_demobilization) {
						if (cur_frm.fields_dict.asset_demobilization.grid.get_selected().length > 0) {
							cur_frm.set_df_property('asset_demobilization', 'read_only', 0)
							refresh_field("asset_demobilization")
							for (var i = cur_frm.doc.asset_demobilization.length - 1; i >= 0; i--) {
								if (cur_frm.doc.asset_demobilization[i].__checked != 1) {
									cur_frm.fields_dict.asset_demobilization.grid.get_row(i).remove()
								}
							}
							var data = cur_frm.doc.asset_demobilization
							for (var i in data) {
								if (cur_frm.doc.demobilization_date < data[i].mobilization_start_date || cur_frm.doc.demobilization_date > data[i].mobilization_end_date) {
									if (cur_frm.doc.asset_demobilization[i].__checked == 1) {
										cur_frm.set_df_property('asset_demobilization', 'read_only', 1)
										frappe.throw(`Demobilization Date Cannot Be Lesser Than Mobilization Start Date or Greater Than Mobilization End Date For Asset ${data[i].asset_id}`)
									}
								}
							}
							cur_frm.set_df_property('asset_demobilization', 'read_only', 1)
							refresh_field("asset_demobilization")
						}
						else {
							frappe.throw("Please Select Some Records")
						}
					} else {
						frappe.throw("No Mobilized Entry Found")
					}
				}
			}
			else {
				cur_frm.set_value('demobilization_date',undefined)
				frappe.throw('Demobilization Date Must be Current Date or Greater Than Current Date')
			}
		}
		else {
			frappe.throw(`Mandatory Fields Required Demobilization Date`)
		}
	}, // end validate

	//to get employees
	get_employee: function (frm) {
		frappe.call({
			method: 'get_allocated_emp',
			doc: cur_frm.doc,
			args: {},
			callback: function (r) {
				if (r.message) {
					var data = r.message
					cur_frm.set_df_property('employee_demobilization', 'read_only', 0)
					cur_frm.clear_table('employee_demobilization')
					for (var i = 0; i < data.length; i++) {
						var row = cur_frm.fields_dict["employee_demobilization"].grid.add_new_row()
						console.log(row)
						frappe.model.set_value(row.doctype, row.name, 'employee', data[i]['employee'])
						frappe.model.set_value(row.doctype, row.name, 'start_date', data[i]['start_date'])
						frappe.model.set_value(row.doctype, row.name, 'end_date', data[i]['end_date'])
						frappe.model.set_value(row.doctype, row.name, 'task', data[i]['task'])
						frappe.model.set_value(row.doctype, row.name, 'employee_type', data[i]['employment_type'])
						frappe.model.set_value(row.doctype, row.name, 'employee_name', data[i]['employee_name'])
						frappe.model.set_value(row.doctype, row.name, 'division', data[i]['division'])
						frappe.model.set_value(row.doctype, row.name, 'project_status', data[i]['project_status'])
						frappe.model.set_value(row.doctype, row.name, 'mobilization_id', data[i]['main_name'])
						frappe.model.set_value(row.doctype, row.name, 'mob_child_id', data[i]['child_name'])
					}
					cur_frm.set_df_property('employee_demobilization', 'read_only', 1)
				}
				else {
					cur_frm.set_value("employee_demobilization", undefined)
					frappe.throw("No Records found")
				}
			}
		});
	},// end get employees

	//to get equipments
	get_equipment: function (frm) {

		frappe.call({
			method: 'get_assets_data',
			doc: cur_frm.doc,
			args: {},
			callback: function (r) {
				if (r.message) {
					var data = r.message
					cur_frm.set_df_property('asset_demobilization', 'read_only', 0)
					cur_frm.clear_table('asset_demobilization')
					for (var i = 0; i < data.length; i++) {
						var row = cur_frm.fields_dict["asset_demobilization"].grid.add_new_row()
						frappe.model.set_value(row.doctype, row.name, 'asset_id', data[i]['asset_id'])
						frappe.model.set_value(row.doctype, row.name, 'mobilization_start_date', data[i]['mobilization_start_date'])
						frappe.model.set_value(row.doctype, row.name, 'mobilization_end_date', data[i]['mobilization_end_date'])
						frappe.model.set_value(row.doctype, row.name, 'asset_type', data[i]['asset_category'])
						frappe.model.set_value(row.doctype, row.name, 'daily_rate', data[i]['daily_rate'])
						frappe.model.set_value(row.doctype, row.name, 'daily_cost', data[i]['daily_cost'])
						frappe.model.set_value(row.doctype, row.name, 'asset_name', data[i]['asset_name'])
						frappe.model.set_value(row.doctype, row.name, 'mobilization_id', data[i]['main_name'])
						frappe.model.set_value(row.doctype, row.name, 'mob_child_id', data[i]['child_name'])
					}
					cur_frm.set_df_property('asset_demobilization', 'read_only', 1)
				}
				else {
					cur_frm.set_value("asset_demobilization", undefined)
					frappe.throw("No Records found")
				}
			}
		});

	},//end get_equipment

	// to hide and display child tables, also to make child tables readonly on condition 
	employee_asset_section: function (frm) {
		if (cur_frm.doc.company && cur_frm.doc.project && cur_frm.doc.demobilize) {
			switch (cur_frm.doc.demobilize) {
				case 'Employee':
					cur_frm.set_df_property('employee_filters', 'hidden', 0)
					cur_frm.set_df_property('employee_demobilize_section', 'hidden', 0)
					cur_frm.set_df_property('equipment_filters', 'hidden', 1)
					cur_frm.set_df_property('equipment_demobilize_section', 'hidden', 1)
					cur_frm.set_value("asset_demobilization", undefined)
					// cur_frm.set_value("employee_demobilization", undefined)
					break;
				case 'Asset':
					cur_frm.set_df_property('employee_filters', 'hidden', 1)
					cur_frm.set_df_property('employee_demobilize_section', 'hidden', 1)
					cur_frm.set_df_property('equipment_filters', 'hidden', 0)
					cur_frm.set_df_property('equipment_demobilize_section', 'hidden', 0)
					cur_frm.set_value("employee_demobilization", undefined)
					// cur_frm.set_value("asset_demobilization", undefined)
					break;
			}
		}
		else {
			cur_frm.set_df_property('employee_filters', 'hidden', 1)
			cur_frm.set_df_property('employee_demobilize_section', 'hidden', 1)
			cur_frm.set_df_property('equipment_filters', 'hidden', 1)
			cur_frm.set_df_property('equipment_demobilize_section', 'hidden', 1)
		}

	}, //end function

	//added filters on company trigger
	company: function (frm) {
		cur_frm.trigger('employee_asset_section')
		cur_frm.set_query("project", function () {
			return {
				filters: {
					"company": cur_frm.doc.company
				}
			}
		})
		cur_frm.set_query("department", function () {
			return {
				filters: {
					"company": cur_frm.doc.company
				}
			}
		})
		cur_frm.set_value('project', undefined)
		cur_frm.set_value('demobilize', undefined)
	},// end trigger

	// start_date: function (frm) {
	// 	cur_frm.trigger('employee_asset_section')
	// 	cur_frm.set_value("employee_demobilization", undefined)
	// 	cur_frm.set_value("asset_demobilization", undefined)
	// },
	// end_date: function (frm) {
	// 	cur_frm.trigger('employee_asset_section')
	// 	cur_frm.set_value("employee_demobilization", undefined)
	// 	cur_frm.set_value("asset_demobilization", undefined)
	// },
	
	//project trigger
	project: function (frm) {
		cur_frm.trigger('employee_asset_section')
	}, //end trigger

	//dmobilize trigger
	demobilize: function (frm) {
		cur_frm.trigger('employee_asset_section')
	},//end trigger

	//department trigger
	department: function (frm) {
		cur_frm.trigger('employee_asset_section')
	},//end trigger

	//employee trigger
	employee: function (frm) {
		cur_frm.trigger('employee_asset_section')
		cur_frm.set_value("employee_demobilization", undefined)
	},//end

	//division trigger
	division: function (frm) {
		cur_frm.trigger('employee_asset_section')
		cur_frm.set_value("employee_demobilization", undefined)
	},//end

	//branch trigger
	branch: function (frm) {
		cur_frm.trigger('employee_asset_section')
		cur_frm.set_value("employee_demobilization", undefined)
	},//end

	//dseignation trigger
	designation: function (frm) {
		cur_frm.trigger('employee_asset_section')
		cur_frm.set_value("employee_demobilization", undefined)
	},//end

	asset_name: function (frm) {
		cur_frm.trigger('employee_asset_section')
		cur_frm.set_value("asset_demobilization", undefined)
	} 
});



