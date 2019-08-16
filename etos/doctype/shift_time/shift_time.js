// Copyright (c) 2018, Digitalprizm and contributors
// For license information, please see license.txt
frappe.ui.form.on("Shift Time",{
    validate:function(frm){
        start_end_diff();
        start_time_limit_diff();
        end_time_limit_diff();
        // if(cur_frm.doc.start_time<cur_frm.doc.early_coming_time_limit){
        //     frappe.throw("Early coming time cannot be greater then Start time")
        // }

        // if(cur_frm.doc.end_time>cur_frm.doc.late_going_time_limit){
        //     frappe.throw("Late going time cannot be less then End time")
        // }
    },

    start_time:function(frm, cdt, cdn) {		 
        start_end_diff();
        // start_time_limit_diff();
    },

    end_time:function (frm) {
        start_end_diff();
        // end_time_limit_diff();
    },

    early_coming_time_limit:function(frm){
        start_time_limit_diff();
    },

    late_going_time_limit:function(frm){
        end_time_limit_diff();
    }
})

function start_time_limit_diff(){
    if(cur_frm.doc.start_time){
        var start_time = cur_frm.doc.start_time;
        var start_limit_time=cur_frm.doc.early_coming_time_limit;
        var total_time= moment.utc(moment.duration(moment(start_time,'hh:mm:ss').diff(moment(start_limit_time,'hh:mm:ss'))).asMilliseconds()).format('HH:mm:ss');
        cur_frm.set_value("early_coming_hrs_limit",total_time);
    }
}

function end_time_limit_diff(){
    if(cur_frm.doc.end_time){
        var end_time = cur_frm.doc.end_time;
        var end_limit_time=cur_frm.doc.late_going_time_limit;
        var total_time= moment.utc(moment.duration(moment(end_limit_time,'hh:mm:ss').diff(moment(end_time,'hh:mm:ss'))).asMilliseconds()).format('HH:mm:ss');
        cur_frm.set_value("late_going_hrs_limit",total_time);
    
    }
}




function start_end_diff(){
    if(cur_frm.doc.start_time && cur_frm.doc.end_time){
        var start_time = cur_frm.doc.start_time;    
        var end_time = cur_frm.doc.end_time;
        var total_time = moment.utc(moment.duration(moment(end_time,'hh:mm:ss').diff(moment(start_time,'hh:mm:ss'))).asMilliseconds()).format('HH:mm:ss');
        cur_frm.set_value("no_of_hours", total_time);
    }
}