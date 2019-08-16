// Copyright (c) 2018, tbtech and contributors
// For license information, please see license.txt

frappe.ui.form.on('Upload Timesheet Process', {
	onload: function(){
		cur_frm.disable_save()

		var stop_loop = setInterval(()=>{
			$(':button',$(cur_frm.fields_dict.get_template.wrapper)).addClass('btn-primary')
			if($(':button',$(cur_frm.fields_dict.get_template.wrapper)).hasClass('btn-primary')){
				clearInterval(stop_loop)
			}
		},100)
	},
	get_template:function() {
		window.location.href = repl(frappe.request.url +
			'?cmd=%(cmd)s', {
				cmd: "etos.etos.doctype.upload_timesheet_process.upload_timesheet_process.get_template"
			});
	},
	refresh: function(frm){
		cur_frm.trigger('upload')
	},
	attendance_date:function(frm){
		cur_frm.trigger('upload')
	},
	project:function(frm){
		cur_frm.trigger('upload')
	},
	default_status: function(frm){
		$.fn.set_def_status()
	},
	violation_category: function(frm){
		$.fn.violation_filter()	
	},
	upload: function (frm) {
		hide_field('section_break_8')
		$(cur_frm.fields_dict.attendance_table.wrapper).empty()
		var $wrapper = $(cur_frm.fields_dict.upload_html.wrapper).empty();
		var modify_emp_list=[]

		cur_frm.set_df_property('section_break_4','hidden',1)

		// upload
		frappe.upload.make({
			parent: $wrapper,
			args: {
				method: 'etos.etos.doctype.upload_timesheet_process.upload_timesheet_process.upload',
				args:{
					'date':cur_frm.doc.attendance_date ? cur_frm.doc.attendance_date : null ,
					'project':cur_frm.doc.project ? cur_frm.doc.project : null
				},
				freeze: true,
				freeze_message: __("Ecxel Data Importing .."),
				async: false
			},
			no_socketio: true,
			sample_url: "e.g. http://example.com/somefile.csv",
			callback: function (attachment, r) {
				
				cur_frm.set_df_property('section_break_4','hidden',0)
				
				var data = {"emp_detail":r.message}

				$(frm.fields_dict['attendance_table'].wrapper)
					.html(frappe.render_template("attendance_violation_process",data));
				
				if(r.message.length > 0){
					unhide_field('section_break_8')
				}

				cur_frm.doc.default_status = undefined
				cur_frm.doc.violation_category = undefined
				refresh_field('default_status')
				refresh_field('violation_category')

				//to ignore special character
				$.fn.jq=function( myid ){
					return ""+ myid.replace( /([ #;&,.+*~\':"!^$[\]()=>|\/@])/g, "\\$1" );	
				}

				$.fn.list_emp=function(emp_id){
					return {'employee_id':emp_id,'employee_name':$("#emp_name_"+$.fn.jq(emp_id)).val(),'division':$("#division_"+$.fn.jq(emp_id)).val(),'task':$("#task_"+$.fn.jq(emp_id)).val(),'bill_rate':$("#bill_rate_"+$.fn.jq(emp_id)).val(),'in_date':$("#in_date_"+$.fn.jq(emp_id)).val(),'in_time':$("#in_time_"+$.fn.jq(emp_id)).val(),'out_date':$("#out_date_"+$.fn.jq(emp_id)).val(),'out_time':$("#out_time_"+$.fn.jq(emp_id)).val(),'total_working':$("#working_hr_"+$.fn.jq(emp_id)).val(),'shift_type':$("#shift_type_"+$.fn.jq(emp_id)).val()}

				}
							
				var $tabObject=$("#custom_table").DataTable({
					'columnDefs': [{
						'targets': 0,
						'orderable': false,					
					}],				 
					'order': [[1, 'asc']],
					"scrollX": true,
					"scrollY": 450,
					"scrollCollapse": true,
					'retrieve': true,
					"paging":         false,
					'bSort': false,
					"searching": false,
					"bLengthChange": false,
					"iDisplayLength": 5,
					"stateSave": true,
					"fnDrawCallback": function( oSettings ) {	}
					
				});

				frappe.call({
					method:"frappe.client.get_list",
					args: {
						doctype: "Leave Type",
						fieldname: ["name"]
					},
					callback: function (r) {
						var opt=r.message
						var option = new Option('' , '');
						$(".task_select").append($(option));
						if(opt){
							for(var i=0;i<opt.length;i++){
								var option = new Option(opt[i]['name'], opt[i]['name']);
								$(".leave_update").append($(option));
							}
						}						
					}
				});
				
				$("#selectAll").on("click", function (e) {
					 if ($(this).hasClass("allChecked")) {
						$('tbody tr').each(function(){
							if(!$(this).attr('hidden')){
								$(this).find("#child_chk").prop("checked", false).removeClass("selected");
								$(this).removeClass("selected");
							}
						 });
						
					} else {
						$('tbody tr').each(function(){
							if(!$(this).attr('hidden')){
								$(this).find("#child_chk").prop("checked", true).addClass("selected");
								$(this).addClass("selected");
							}
						 });
					}
					$(this).toggleClass("allChecked");
				});

				//set a row select of checkbox is checked
				$.fn.set_checkbox_tig=function(){
					$(".checkbox").click(function() {
						
						if(!$(this).is("#selectAll")){
							if ($(this).is(":checked")) 
							{
								$(this).addClass("selected");
								$(this).closest('tr').addClass("selected");
							}
							else{
								$(this).removeClass("selected");
								$(this).closest('tr').removeClass("selected");
							}
						}
					});
				}

				$.fn.set_checkbox_tig();

				$("#remove").on("click",function(){
					var rows = $tabObject.rows('.selected')
					.remove()
					.draw(false);

					if(rows[0].length > 0){
						frappe.msgprint("Selected Record Removed Successfully")
					}
					else{
						frappe.msgprint("There is no Record Selected")
					}					
				})

				//short violation data to top
				$.fn.short_violation = function(){
					$('tbody tr').each(function(){

						if ($(this).hasClass("violated")){
						var row = $tabObject.row( $(this).parents('tr') );
    					var rowNode = row.node();
    					row.remove();
						$tabObject
        					.row( rowNode )
							.draw();
						}
					});
					$.fn.set_checkbox_tig();
				}

				
				$.fn.create_list= function(cond=null,parent=null){
					var emp_id= (cond=='filter') ? parent : ''		
					if (cond=='filter')
					{
						if (emp_id){
							modify_emp_list = $.grep(modify_emp_list, function(item) { 	
								return item.employee_id != emp_id;
							} ,false);
							
							modify_emp_list.push($.fn.list_emp(emp_id))
						}
					}
					else
					{
						var emp_list = []
						var thr_val = ''
						$.each($("#emp_table_body tr") || [],function( i ,obj){
							emp_id = $(obj).attr('id')
							if ($("#status_"+$.fn.jq(emp_id)).val()){
								if($("#status_"+$.fn.jq(emp_id)).val()=='Present' && $.fn.manditary_field(emp_id)){
									thr_val+='Please fill the IN and OUT Datetime for Employee <b>'+emp_id+'</b></br>'
								}
								var get_list = $.fn.list_emp(emp_id)
								Object.assign(get_list, {'status': $("#status_"+$.fn.jq(emp_id)).val(),'violations': $("#violations_"+$.fn.jq(emp_id)).text(),'ot_hours':$("#ot_hr_"+$.fn.jq(emp_id)).val(),'leave_type': $("#leave_type_"+$.fn.jq(emp_id)).val(),'actual_in_date':$("#actual_in_date_"+$.fn.jq(emp_id)).val(),'actual_in_time':$("#actual_in_time_"+$.fn.jq(emp_id)).val(),'actual_out_date':$("#actual_out_date_"+$.fn.jq(emp_id)).val(),'actual_out_time':$("#actual_out_time_"+$.fn.jq(emp_id)).val()});
								emp_list.push(get_list)
							}
							else{
								thr_val += 'Violation of Employee <b>'+emp_id+'</b> is Not Cleared </br>'
							}
						});
						if (thr_val){
							$(".btn").removeAttr('disabled');
							frappe.throw(thr_val)
						}
					}
					return emp_list
				}
				
				
				$("#emp_table_body").on("change",function(e){
					$(".btn").removeAttr('disabled');
					var id = e.target.id;
					
					var $parent = $("#"+$.fn.jq(id)).closest("tr").attr('id')
					
					if(!$("#"+$.fn.jq(id)).hasClass('checkbox') && !$("#"+$.fn.jq(id)).hasClass('status_update')){
						$.fn.create_list('filter',$parent)
					}
				})

				$("#validate").on("click", function(){  
					$(".btn").attr("disabled", "disabled");

					if (modify_emp_list.length>0){
						frappe.call({
							method:"validate_attend_rcd",
							doc:cur_frm.doc,
							args:{
								'data':modify_emp_list,
							},
							freeze: true,
							freeze_message: __("Validate Record in Excel"),
							async:false,
							callback:function(r){								
								data=r.message
								if (data){
									for(var i=0;i<data.length;i++){	
										
										//clear the previous values
										$("#violations_"+$.fn.jq(data[i]['employee_id'])).html("")
										$("#violations_"+$.fn.jq(data[i]['employee_id'])).removeClass()
										$("#"+$.fn.jq(data[i]['employee_id'])).removeClass("violated")
										$("#leave_type_"+$.fn.jq(data[i]['employee_id'])).prop('disabled', false).val('').prop('disabled',true);

										//set new value
										if (data[i]['violation_status']){
											$("#violations_"+$.fn.jq(data[i]['employee_id'])).html("<div class=\"list-group\">"+data[i]['violation_status']+"</div>")
											$("#"+$.fn.jq(data[i]['employee_id'])).addClass("violated")
											$("#violations_"+$.fn.jq(data[i]['employee_id'])).addClass(data[i]['violation_class'])
										}										
										
										if(data[i]['leave_type']){									
											$("#leave_type_"+$.fn.jq(data[i]['employee_id'])).prop('disabled', false).val(data[i]['leave_type']).prop('disabled',true);
										}										
										
										$("#status_"+$.fn.jq(data[i]['employee_id'])).val(data[i]['status'])										
										$("#working_hr_"+$.fn.jq(data[i]['employee_id'])).val(data[i]['total_working'])
										$("#ot_hr_"+$.fn.jq(data[i]['employee_id'])).val(data[i]['ot_hr'])

									}
									modify_emp_list=[]
								}
							}
						});
						frappe.msgprint("Records has been Validated Successfully")
					}
					else{
						frappe.msgprint("There is No Changes to need to be Validate")
					}

					$.fn.short_violation()
					$(".btn").removeAttr('disabled');
				});


				$("#process").on("click",function(){
					$(".btn").attr("disabled", "disabled");
					//trigger validate for safety perpose to find any violation
					//create a list of modify record
					var emp_list=$.fn.create_list();
					
					if (emp_list.length>0){
						frappe.call({
							method:"insert_record_in_table",
							doc:cur_frm.doc,
							args:{
								'data':emp_list
							},
							freeze: true,
							freeze_message: __("Inserting Attendance .."),
							callback:function(r){								
								data=r.message
								if(data){
									frappe.msgprint("Attendance Created Successfully")
									cur_frm.trigger('upload')
								}
							}
						});
					}
					emp_list=[]
					$(".btn").removeAttr('disabled');
				});

				function isValidDate(dateString) {
					var regEx = /^\d{4}-\d{2}-\d{2}$/;
					if(!dateString.match(regEx)) return false;  // Invalid format
					var d = new Date(dateString);
					if(Number.isNaN(d.getTime())) return false; // Invalid date
					return d.toISOString().slice(0,10) === dateString;
				}

				function isValidTime(timeString) {
					var regEx = /^\d{2}:\d{2}:\d{2}$/;
					if(!timeString.match(regEx)) return false;  // Invalid format
					var parts = timeString.split(':');
					if (parts[0] > 23 || parts[1] > 59 || parts[2] > 59)  return false;	// Invalid date
					return true;
				}

				$(".date_val").change(function(e){					
					var id = e.currentTarget.id;
					var $parent=$("#"+$.fn.jq(id)).closest("tr").attr('id')
					if($("#"+$.fn.jq(id)).val()){
						if(isValidDate($("#"+$.fn.jq(id)).val())){
							if($("#"+$.fn.jq(id)).val() != cur_frm.doc.attendance_date){
								$("#"+$.fn.jq(id)).val(e.currentTarget.defaultValue)
								frappe.throw("Date Cannot be outside Attendance Date")
							}
							$.fn.date_validat_diff($parent,e)
							$.fn.ot_hr_function($parent)
						}
						else{
							
							$("#"+$.fn.jq(id)).val(e.currentTarget.defaultValue)
							frappe.throw("Invalid Date Format")
						}
					}
				});
				$(".time_val").change(function(e){
					var id = e.currentTarget.id;
					var $parent = $("#"+$.fn.jq(id)).closest("tr").attr('id')
					if($("#"+$.fn.jq(id)).val()){
						if(isValidTime($("#"+$.fn.jq(id)).val())){
							$.fn.date_validat_diff($parent,e)
							$.fn.ot_hr_function($parent)
						}
						else{
							$("#"+$.fn.jq(id)).val(e.currentTarget.defaultValue)
							frappe.throw("Invalid Time Format")
						}
					}
				});
				
				$.fn.manditary_field = function(parent){
					if (!$("#in_date_"+$.fn.jq(parent)).val() || !$("#in_time_"+$.fn.jq(parent)).val() || !$("#out_date_"+$.fn.jq(parent)).val() || !$("#out_time_"+$.fn.jq(parent)).val()) return true;
					return false;
				}


				$(".status_update").change(function(e){
					var id=e.currentTarget.id;
					var $parent=$("#"+$.fn.jq(id)).closest("tr").attr('id')
					
					if($('#violations_'+$.fn.jq($parent)).hasClass('attendance_violation')){
						$("#"+$.fn.jq(id)).val(e.currentTarget.defaultValue)
						frappe.throw('Attendance for employee '+$parent+' is already marked')
					}

					if($('#violations_'+$.fn.jq($parent)).hasClass('stop_attendance')){
						$("#"+$.fn.jq(id)).val(e.currentTarget.defaultValue)
						frappe.throw('Attendance Date cannot be less then Joining Date for Employee '+$parent)
					}

					if($("#leave_type_"+$.fn.jq($parent)).val() && $("#"+$.fn.jq(id)).val() != 'On Leave'){
						$("#"+$.fn.jq(id)).val(e.currentTarget.defaultValue)
						frappe.throw('Leave Application Exist for Employee <b>'+$parent+'</b>')
					}

					if(!$("#leave_type_"+$.fn.jq($parent)).val() && $("#"+$.fn.jq(id)).val() == 'On Leave'){
						$("#"+$.fn.jq(id)).val(e.currentTarget.defaultValue)
						frappe.throw('There is No Leave Application Exist for Employee <b>'+$parent+'</b>')
					}

					if($("#"+$.fn.jq(id)).val()=='Present'){
						if ($.fn.manditary_field($parent)){
							$("#"+$.fn.jq(id)).val(e.currentTarget.defaultValue)
							frappe.throw('Please Fill the IN and OUT Datetime for Employee <b>'+$parent+'</b>')
						}
						$.fn.ot_hr_function($parent)
					}
					else{
						$("#ot_hr_"+$.fn.jq($parent)).val("00:00:00");
					}

				});

				$.fn.date_validat_diff = function(parent,row){
					var $in_date=$("#in_date_"+$.fn.jq(parent)).val()
					var $in_time=$("#in_time_"+$.fn.jq(parent)).val()
					var $out_date=$("#out_date_"+$.fn.jq(parent)).val()
					var $out_time=$("#out_time_"+$.fn.jq(parent)).val()
					if ($in_date && $in_time && $out_date && $out_time){
						frappe.call({
							method:"etos.etos.doctype.upload_timesheet_process.upload_timesheet_process.date_diff_val",
							args:{								
								'in_date' : $in_date,
								'in_time' : $in_time,
								'out_date' : $out_date,
								'out_time' : $out_time,								
							},
							freeze: true,
							freeze_message: __("..Validating Date"),
							async:false,
							callback:function(r){							
								data=r.message
								if (data){
									var id = row.currentTarget.id;
									$("#"+$.fn.jq(id)).val(row.currentTarget.defaultValue)
									frappe.throw(data)
								}								
							}							
						});
					}
				}		


				$.fn.ot_hr_function = function(parent){
					var $in_date=$("#in_date_"+$.fn.jq(parent)).val()
					var $in_time=$("#in_time_"+$.fn.jq(parent)).val()
					var $out_date=$("#out_date_"+$.fn.jq(parent)).val()
					var $out_time=$("#out_time_"+$.fn.jq(parent)).val()
					var $shift_type=$("#shift_type_"+$.fn.jq(parent)).hasClass('special') ? null : $("#shift_type_"+$.fn.jq(parent)).val() 
					var $status=$("#status_"+$.fn.jq(parent)).val()
					
					if (["Present","Half Day"].includes($status) && $in_date && $in_time && $out_date && $out_time){
						frappe.call({
							method:"etos.etos.doctype.upload_timesheet_process.upload_timesheet_process.cal_ot_hr",
							args:{
								'shift_type' : $shift_type,
								'in_date' : $in_date,
								'in_time' : $in_time,
								'out_date' : $out_date,
								'out_time' : $out_time,
								'status' : $status
							},
							freeze: true,
							freeze_message: __("Calcuation OT Hours.."),
							async:false,
							callback:function(r){							
								data=r.message
								if (data){
									$("#working_hr_"+$.fn.jq(parent)).val(data[1])
									$("#ot_hr_"+$.fn.jq(parent)).val(data[0]);
								}								
							}							
						}); 
					}
				}				
			}
		});
		$(":contains('Attach')").closest('button').addClass("btn-primary");
	}
});



$.fn.set_def_status = function(){
	var count=0
	$('tbody tr .selected').each(function(){
		var $id = $(this).closest('tr').attr('id')
		count ++ ;
		try{
			$('#status_'+$.fn.jq($id)).val(cur_frm.doc.default_status).trigger('change')
		}
		catch(err){
			
		}
	})
	if( Number(count) > 0){
		frappe.msgprint("Status Updated Successfully To "+cur_frm.doc.default_status)
	}
	else{
		frappe.msgprint("Please Select Some Record to Set Status")
	}

	cur_frm.doc.default_status = undefined
	refresh_field('default_status')
}

$.fn.create_key = function(input){
	return input.toLowerCase().replace(' ','_')
}

$.fn.violation_filter = function(){
	if ($('#selectAll').hasClass('allChecked')){
		$('#selectAll').trigger('click')
	}
	else{
		$('#selectAll').trigger('click')
		$('#selectAll').trigger('click')
	}
	$('tbody tr').each(function(){
		
		var $id = $(this).closest('tr').attr('id')
		
		if (!$('#violations_'+$.fn.jq($id)).hasClass($.fn.create_key(cur_frm.doc.violation_category))){
			$(this).closest('tr').attr('hidden',true)
		}
		else{
			$(this).closest('tr').attr('hidden',false)
		}
	})
}