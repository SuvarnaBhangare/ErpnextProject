// Copyright (c) 2018, Digitalprizm and contributors
// For license information, please see license.txt

cur_frm.add_fetch('payroll_period','start_date','from_date')
cur_frm.add_fetch('payroll_period','end_date','to_date')


frappe.ui.form.on('Salary Allowance Process', {
	refresh: function(frm){
		cur_frm.disable_save();
		cur_frm.set_df_property('section_break_3','hidden',1)
	},
	from_date:function(frm){
		
		if(cur_frm.doc.from_date){
			cur_frm.set_df_property('section_break_3','hidden',0)
			cur_frm.trigger('rend_html')
		}
		else{
			cur_frm.set_df_property('section_break_3','hidden',1)
		}
	},
	rend_html: function(frm) {
		if (!cur_frm.doc.__islocal) {
			frappe.call({
				method:"get_data",
				doc:cur_frm.doc,
				args: { },
				freeze: true,
				freeze_message: __("Data is Loading, it might take some time"),
				callback: function(r)
				{
					// console.log(r.message[0])
					$(frm.fields_dict['adjustment'].wrapper)
						.html(frappe.render_template("salary_allowance_process",r.message[0]));
					$.fn.script_sal_allow_process();

					$("#Update_data").on('click',function(){
						// console.log("in")
						$.fn.process();
					})
					$.fn.decimal_validate()
					$.fn.previous_record()
				}
			})
		}
	},
	// store_name:function(frm){
	// 	$.fn.store_filter()
	// },
	payroll_period: function(frm){
		if(!cur_frm.doc.payroll_period){
			cur_frm.set_value('from_date',null)
			cur_frm.set_value('to_date',null)
			$(cur_frm.fields_dict.adjustment.wrapper).empty()
		}
	}
});

$.all_pages
$.fn.script_sal_allow_process=function(){
	var $tabObject=$("#emp_table").DataTable({
		'columnDefs': [{
			'bSortable': false,
     		'aTargets': 'no-sort'					
		}],
		"scrollX": true,
		"scrollY": 450,
		"scrollCollapse": true,
		'retrieve': true,
		"paging": false,
		'bSort': true,
		"searching": true,
		"bLengthChange": true,
		"stateSave": true,	
	});
	$tabObject.order( [[0, 'asc' ]] )
	.search('')
	.draw();
	
	$.all_pages=$tabObject.cells( ).nodes( );
	$.fn.body_trigger()
	
}

$.fn.list_emp=function(id){
	return {'sort_val':id,'emp_name':$('#'+$.fn.jq(id)).closest('tr').attr('id'),"comp_name":$("#"+$.fn.jq(id)).closest('table').find('th').eq($("#"+$.fn.jq(id)).closest('td').index()).text(),"comp_val":$("#"+$.fn.jq(id)).val()}
}
$.get_list=[]
$.fn.create_list=function(id){
	$.get_list = $.grep($.get_list, function(item) {
		return item.sort_val != id;
	} ,false);
	$.get_list.push($.fn.list_emp(id))
	// console.log($.get_list)
}

//to ignore special character
$.fn.jq=function( myid ){
	return ""+ myid.replace( /([ #;&,.+*~\':"!^$[\]()=>|\/@])/g, "\\$1" );	
}

$.fn.date_val=function( id=null ){
	if(!cur_frm.doc.from_date || !cur_frm.doc.to_date){
		if(id){
			$("#"+$.fn.jq(id)).val($("#"+$.fn.jq(id)).defaultValue)
		}
		frappe.throw({title:"Mandatory",message:"Please Select Date Before Process"})
	}
	else{
		return 1
	}
}

$.fn.body_trigger=function(){
	$("#emp_table_body").on("change",function(e){
		var $id = e.target.id;
		var $def_val=e.target.defaultValue
		var $new_val=e.target.value
		// console.log($("#"+$.fn.jq($id)).val())
		// console.log($("#"+$.fn.jq($id)).closest('table').find('th').eq($("#"+$.fn.jq($id)).closest('td').index()).text())
		

		if ($def_val!=$new_val && $.fn.date_val($id)){
				$.fn.create_list($id)
			}
	})
}
$.fn.process=function(){
	$.fn.date_val()

	if(cur_frm.doc.from_date && cur_frm.doc.to_date && $.get_list){
        frappe.call({
			method:"update_sal_adj",
			doc:cur_frm.doc,
			args:{
			"sal_comp_val":$.get_list
			},
			freeze: true,
			freeze_message: __("Data is Uploading, it might take some time"),
			callback:function(r){
				frappe.msgprint(r.message);
				$.get_list=[]
			}
		})
	}
}


$.fn.previous_record=function(){
	$.fn.date_val()

	if(cur_frm.doc.from_date && cur_frm.doc.to_date){
		frappe.call({
			method:"get_prev_data",
			doc:cur_frm.doc,
			args:{	},
			freeze: true,
			freeze_message: __("Data is Loading, it might take some time"),
			callback:function(r){
				// console.log(r.message)
				if(r.message){
					for(var k=0;k<r.message.length;k++){
						var $row=$("#"+$.fn.jq(r.message[k]["employee__id"])).index()
						// console.log($row)
						var $col=$('th:contains('+r.message[k]["salary_component"]+')').index()-4
						// console.log($col)
						$("#comp_val_"+$row+"_"+$col).val(r.message[k]["value"])
					}
				}
				$.fn.disable_field_salary_slip()
			}
		})
	}

	
}

$.fn.disable_field_salary_slip=function(){
	frappe.call({
		method:"salary_slip_val",
		doc:cur_frm.doc,
		args:{	},
		freeze: true,
		freeze_message: __("Data is Loading, it might take some time"),
		callback:function(r){
			// console.log(r.message)
			if(r.message){
				for(var k=0;k<r.message.length;k++){
					var $row=$("#"+$.fn.jq(r.message[k]["employee"])).index()
					for(var j=0;j<$("thead th").length-4;j++){
						$("#comp_val_"+$row+"_"+j).attr("readonly", "readonly").css("background-color", "#d9dddd");
						$("#"+$.fn.jq(r.message[k]["employee"])).css("background-color", "#d9dddd");

					}	
				}

			}
		}
	})
}


// $.fn.store_filter=function (e) {
// 	var input, filter, table, tr, td, i;
// 	input = cur_frm.doc.store_name;

// 	if(input!="Select Store"){
// 		filter = input.toUpperCase();
// 		table = document.getElementById("emp_table");
// 		tr = table.getElementsByTagName("tr");
// 		for (i = 0; i < tr.length; i++) {
// 			td = tr[i].getElementsByTagName("td")[3];
// 			if (td) {
// 				if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
// 					tr[i].style.display = "";
// 				} else {
// 					tr[i].style.display = "none";
// 				}
// 			}       
// 		}
// 	}else{
// 		table = document.getElementById("emp_table");
// 		tr = table.getElementsByTagName("tr");
// 		for (i = 0; i < tr.length; i++) {
// 			tr[i].style.display = "";     
// 		}
// 	}
// }

$.fn.decimal_validate=function(){
	$(".validate_number").on("keypress keyup blur",function (event) {
 		$(this).val($(this).val().replace(/[^0-9\.]/g,''));
		if ((event.which != 46 || $(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57)) {
		$(".error").html(event.which)
			event.preventDefault();
		}
	});
}