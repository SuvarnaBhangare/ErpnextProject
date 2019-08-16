// Copyright (c) 2018, Digitalprizm and contributors
// For license information, please see license.txt

cur_frm.add_fetch("employee_id","employee_name","employee_name");
cur_frm.add_fetch("airline_agent", "name1", "agent_name");

function set_passenger(frm)
{
	if(cur_frm.doc.number_of_reentries_required==1)
	{
		cur_frm.set_value("passenger_names",cur_frm.doc.employee_name)
	}
	else if(cur_frm.doc.number_of_reentries_required>1)
	{
		if(cur_frm.doc.employee_id){
			frappe.call({
				method: "etos.etos.doctype.exit_reentry_visa.exit_reentry_visa.family_members",
				args: { 
					"employee_id": cur_frm.doc.employee_id,
				},
				async:false,
				callback: function(r)
				{
					var result=r.message;
					var pass=cur_frm.doc.employee_name;
					for(var i=0;i<result.length;i++)
					{
						pass = pass.concat("\n\n"+result[i].member_name+"   "+result[i].gender+"    "+result[i].date_of_birth);
					}
					cur_frm.set_value("passenger_names",pass);
				}
			});
		}  
	}
	else
	{
		cur_frm.set_value("passenger_names","");
	}
  
	if(cur_frm.doc.set_from_date)
	{
		cur_frm.set_value("from_date",cur_frm.doc.set_from_date)  
	}
	if(cur_frm.doc.set_to_date)
	{
		cur_frm.set_value("to_date",cur_frm.doc.set_to_date)  
	}
}


frappe.ui.form.on('Exit ReEntry Visa', {
	employee_id: function(frm) {
    	set_passenger(frm)

  	},
  	validate: function(frm) {

		var reentry_charges=cur_frm.doc.reentry_charges;
		if (reentry_charges<0){
			frappe.throw({title:"Re-Entry charges Cannot Be Negative.",message:"Re-Entry charges Cannot Be Negative."})
		}

			
		if(cur_frm.doc.from_date>=cur_frm.doc.to_date){
			frappe.throw({title:"Mandatory",message:"To Date Should not be less than or equal to From Date"})
		}
	},
	refresh: function(frm){
		if(cur_frm.doc.__last_sync_on &&  cur_frm.doc.docstatus != 2){
			cur_frm.add_custom_button(('Email'), function(frm) {
				// var user=frappe.session.user_email;
				new frappe.views.CommunicationComposer(
				//     sender:user,
				//     subject: "Exit ReEntry Visa: "+cur_frm.doc.name+"Employee Name: "+cur_frm.doc.employee_name,
				//     recipients:"jagdishr@avu.net.in",
				// message:"The above employee has been allocated respective amount as traving expance"
				
				);
			});
		}   
	}
});
