// Copyright (c) 2018, Digitalprizm and contributors
// For license information, please see license.txt
cur_frm.add_fetch("employee_id","employee_name","employee_name");
cur_frm.add_fetch("airline_agent", "name1", "agent_name");

var emp_res,air_res,validate_count

frappe.ui.form.on('Airline Ticket Request', {
	employee_id: function(frm) {
		cur_frm.trigger('valid_head_count');
		cur_frm.trigger('validate_head_count');
	},
  	validate: function(frm) {
		cur_frm.trigger('date_validate')
		if(cur_frm.doc.number_of_eligible_tickets<=0)
		{
			frappe.throw({title:"Mandatory",message:"Eligible tickets should not be zero"});
		}
		if(cur_frm.doc.reason=="Vacation"){
			if(cur_frm.doc.available_tickets<=0)
			{      
				frappe.throw({title:"Mandatory",message:"Sorry this employee has no more privilege to take more tickets"})
			}
			if(cur_frm.doc.number_of_eligible_tickets>validate_count)
			{
				frappe.throw({title:"Mandatory",message:"Eligible tickets should not be greater than Available tickets"})
			}
		}
  	},
	number_of_eligible_tickets:function(frm)
	{
		cur_frm.trigger('set_passenger')
	},
	to_date: function(frm) {
		cur_frm.trigger('date_validate')
		cur_frm.trigger('valid_head_count');
		cur_frm.trigger('validate_head_count');
		cur_frm.trigger('set_passenger')	
	},
	from_date: function(frm) {
		cur_frm.trigger('date_validate')
		cur_frm.trigger('valid_head_count');
		cur_frm.trigger('validate_head_count');
		cur_frm.trigger('set_passenger')
	},
	date_validate:function(frm){
		if(cur_frm.doc.from_date && cur_frm.doc.to_date){
		if(cur_frm.doc.from_date >= cur_frm.doc.to_date){
			frappe.throw({title:"Mandatory",message:"To Date Should not be less than or equal to From Date"})
		}
		}
	},
	set_passenger: function(frm){
		if(cur_frm.doc.number_of_eligible_tickets==1)
		{
			cur_frm.set_value("passenger_names","Name    Gender    Date of Birth\n"+cur_frm.doc.employee_name+"  "+emp_res.gender+"  "+moment(emp_res.date_of_birth,'YYYY-MM-DD').format('DD-MM-YYYY'))
		}
		else if(cur_frm.doc.number_of_eligible_tickets>1)
		{
			if(cur_frm.doc.employee_id){
				frappe.call({
					method: "family_members",
					args: {   },
					doc: cur_frm.doc,
					async:false,
					callback: function(r)
					{
						var pass="Name    Gender    Date of Birth\n"+cur_frm.doc.employee_name+"    "+emp_res.gender+"    "+moment(emp_res.date_of_birth,'YYYY-MM-DD').format('DD-MM-YYYY');
						var result=r.message;
						if(result){
							for(var i=0;i<result.length;i++)
							{
								var birth_date,gen,mem_name;
								if(!result[i].date_of_birth){
								birth_date='    '
								}
								else{
								birth_date=moment(result[i].date_of_birth,'YYYY-MM-DD').format('DD-MM-YYYY');
								}
								if(!result[i].gender){
								gen='    '
								}
								else{
								gen=result[i].gender;
								}
								if(!result[i].member_name){
								mem_name='    '
								}
								else{
								mem_name=result[i].member_name;
								}
								pass=pass.concat("\n"+mem_name+"    "+gen+"    "+birth_date);
							}
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
	},
	validate_head_count :function(frm){
		if(cur_frm.doc.from_date && cur_frm.doc.reason && cur_frm.doc.reason == "Vacation"){
			if(emp_res.year){
				var val_year = 0,diff_year = 0;
				var join_year=moment(emp_res.date_of_joining,'YYYY-MM-DD')
				var val_year=moment(cur_frm.doc.from_date,'YYYY-MM-DD')
			
				diff_year=moment.duration(val_year.diff(join_year)).asDays()
				diff_year=diff_year%(365*emp_res.year)
				
				var from_date=moment(cur_frm.doc.from_date,'YYYY-MM-DD').add(-diff_year,'d').format('YYYY-MM-DD');
				var to_date=moment(from_date,'YYYY-MM-DD').add(emp_res.year,'Y').add(-1,"d").format('YYYY-MM-DD');
				
				if(cur_frm.doc.employee_id){
					frappe.call({
						method: "req_head_count",
						args: { 
							"from_date":from_date,
							"to_date":to_date,
						},
						doc: cur_frm.doc,
						async:false,
						callback: function(r)
						{  
							console.log(r);
							air_res=r.message[0];
							console.log(emp_res.number_of_trips*emp_res.eligible_head_count_including_self)
							console.log(air_res.ticket_count)
							validate_count=(emp_res.number_of_trips*emp_res.eligible_head_count_including_self)-air_res.ticket_count;
							console.log(validate_count)
							cur_frm.set_value("available_tickets",validate_count);
							
						}
					});
				}
				else{
					cur_frm.set_value("available_tickets",0);
				}
			} 
			else{
				cur_frm.set_value("available_tickets",0);
			}
		}
		
	},
	valid_head_count: function(frm){
		if(cur_frm.doc.employee_id && cur_frm.doc.reason){
			frappe.call({
				method: "head_count",
				args: { },
				doc: cur_frm.doc,
				async:false,
				callback: function(r)
				{  
					console.log(r);
					emp_res = r.message[0];
					cur_frm.set_value("number_of_eligible_tickets",emp_res.number_of_ticket);
					cur_frm.set_value("origin_airports",emp_res.origin_airport);
					cur_frm.set_value("destination__airports",emp_res.destination_airport);
					cur_frm.set_value("class",emp_res.class);
					if(!cur_frm.doc.number_of_eligible_tickets)
					{
						cur_frm.set_value("number_of_eligible_tickets","0");
					}
				}
			});
		}
	}  
});



