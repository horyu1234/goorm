/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.help.bug_report = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
	this.treeview = null;
};

org.goorm.core.help.bug_report.prototype = {
	init: function () {
		var self = this;
		
		var handle_ok = function() {
			var pan = this;
			
			if($("#bug_reports_title").val()=="") {
				alert.show(core.module.localization.msg["alert_title_empty"]);
				return false;
			}
			else if($("#bug_reports_author").val()=="") {
				alert.show(core.module.localization.msg["alert_author_empty"]);
				return false;
			}
			else if($("#bug_reports_email").val()=="") {
				alert.show(core.module.localization.msg["alert_email_empty"]);
				return false;
			}
			else if($("#bug_reports_version").val()=="") {
				alert.show(core.module.localization.msg["alert_version_empty"]);
				return false;
			}
			else if($("#bug_reports_module").val()=="") {
				alert.show(core.module.localization.msg["alert_module_empty"]);
				return false;
			}
			else if($("#bug_reports_content").val()=="") {
				alert.show(core.module.localization.msg["alert_contents_empty"]);
				return false;
			}
			
			var d = new Date();
			
			var postdata = {
				mid: "bug_report",
				document_srl: "",
				title: $("#bug_reports_title").val(),
				allow_comment: "Y",
				allow_trackback: "N",
				nick_name: $("#bug_reports_author").val(),
				password: (d.getMinutes()+d.getSeconds()),
				act: "procBoardInsertDocument",
				module: "board",
				email_address: $("#bug_reports_email").val(),
				extra_vars1: $("#bug_reports_version").val(),
				extra_vars2: $("#bug_reports_module").val(),
				content: $("#bug_reports_content").val()
			};"OK"
			
			$.post("", postdata, function (data) {
				if($(data).find("h1").text()=="success") {
					notice.show(core.module.localization.msg["notice_write_done"]);
					pan.hide(); 
				}
				else {
					alert.show(core.module.localization.msg["alert_cannot_write"]);
					pan.hide(); 
				}
			});		
		};
		
		this.buttons = [ {text:"<span localization_key='send'>Send</span>", handler:handle_ok, isDefault:true}]; 
						 
		this.dialog = new org.goorm.core.help.about.dialog();
		this.dialog.init({
			title:"Send Bug Report", 
			path:"configs/dialogs/org.goorm.core.help/help.bug_report.html",
			width:620,
			height:520,
			modal:true,
			buttons:this.buttons,
			success: function () {
				
			}			
		});
		this.dialog = this.dialog.dialog;
	}, 

	show: function () {
		$("#bug_reports_author").val(core.user.first_name+"_"+core.user.last_name);
		$("#bug_reports_title").val("");
		$("#bug_reports_email").val("");
		$("#bug_reports_version").val(core.env.version);
		$("#bug_reports_module").val("");
		$("#bug_reports_content").val("");
		this.dialog.panel.show();
	}
};
