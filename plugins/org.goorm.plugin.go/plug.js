/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/
 
org.goorm.plugin.go = function () {
	this.name = "go";
	this.mainmenu = null;
	this.debug_con = null;
	this.current_debug_project = null;
	this.terminal = null;
	this.preference = null;
};

org.goorm.plugin.go.prototype = {
	init: function () {
		this.add_project_item();
		
		this.mainmenu = core.module.layout.mainmenu;
		
		//this.debugger = new org.goorm.core.debug();
		//this.debug_message = new org.goorm.core.debug.message();
		
		this.cErrorFilter = /[A-Za-z]* error: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.cWarningFilter = /[A-Za-z]* warning: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.lineFilter = /:[0-9]*:/;
		
		this.add_mainmenu();
		
		this.add_menu_action();
		
		//core.dictionary.loadDictionary("plugins/org.uizard.plugin.c/dictionary.json");
		
		this.preference = core.preference.plugins['org.goorm.plugin.go'];
	},
	
	add_project_item: function () {
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project-type='go'><div class='project_type_icon'><img src='/org.goorm.plugin.go/images/go.png' class='project_icon' /></div><div class='project_type_title'>GO Project</div><div class='project_type_description'>GO Project using GNU Compiler Collection</div></div>");
		
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all go' description='  Create new project for GO' projecttype='go' plugin_name='org.goorm.plugin.go'><img src='/org.goorm.plugin.go/images/go_console.png' class='project_item_icon' /><br /><a>GO default Project</a></div>");
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all go' description='  Create fobonacci project for GO' projecttype='go' plugin_name='org.goorm.plugin.go'><img src='/org.goorm.plugin.go/images/go_console.png' class='project_item_icon' /><br /><a>GO fibonacci sample</a></div>");
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all go' description='  Create concurrent prime sleve project for GO' projecttype='go' plugin_name='org.goorm.plugin.go'><img src='/org.goorm.plugin.go/images/go_console.png' class='project_item_icon' /><br /><a>GO prime sleve sample</a></div>");
		
		$(".project_dialog_type").append("<option value='go'>GO Projects</option>").attr("selected", "");
	},
	
	add_mainmenu: function () {
		var self = this;
		
		$("ul[id='plugin_new_project']").append("<li class=\"yuimenuitem\"><a class=\"yuimenuitemlabel\" href=\"#\" action=\"new_file_go\" localizationKey='file_new_go_project'>GO Project</a></li>");
		this.mainmenu.render();
	},
	
	add_menu_action: function () {
		$("a[action=new_file_go]").unbind("click");
		$("a[action=new_file_go]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project-type=go]").trigger("click");
			$("#project_new").find(".project_types").scrollTop($(".project_wizard_first_button[project-type=go]").position().top - 100);
		});
	},
	
	new_project: function(data) {
		/* data = 
		   { 
			project_type,
			project_detailed_type,
			project_author,
			project_name,
			project_desc,
			use_collaboration
		   }
		*/
		
		switch(data.project_detailed_type) {
		case "GO fibonacci sample": 
			data.project_detailed_type="fibonacci";
			break;
		case "GO prime sleve sample":
			data.project_detailed_type="prime";
			break;
		case "GO default Project":
		default:
			data.project_detailed_type="default";
		}
		
		var send_data = {
				"plugin" : "org.goorm.plugin."+data.project_type,
				"data" : data
		};
		
		$.get('/plugin/new', send_data, function(result){
			// 가끔씩 제대로 refresh가 안됨.
			setTimeout(function(){
				core.module.layout.project_explorer.refresh();
			}, 500);
		});
	},
	
	run: function(path) {
		var self=this;
		var property = core.property.plugins['org.goorm.plugin.go'];
		
		var sourcepath = property['plugin.go.source_path'];
		var main = property['plugin.go.main']+".go";

		var cmd1 = "go run ./"+sourcepath+main;
		core.module.layout.terminal.send_command(cmd1+'\r');
	},
	
	debug: function (path) {
		/*
		var self = this;
		var property = core.property.plugins['org.goorm.plugin.go'];
		var table_variable = core.module.debug.table_variable;
		var debug_module = core.module.debug;
		this.terminal = core.module.layout.workspace.window_manager.open("/", "debug", "terminal", "Terminal").terminal;
		this.current_debug_project = path;
		this.prompt = /(\(gdb\)[\s\n]*)$/;
		this.terminal.debug_endstr = /exited normally/;
		
		// debug탭 초기화
		table_variable.initializeTable();
		table_variable.refreshView();
		
		this.breakpoints = [];
		
		// debug start!
		var send_data = {
				"plugin" : "org.goorm.plugin.go",
				"path" : path,
				"mode" : "init"
		};
		
		if(this.terminal.index != -1) {
			self.debug_cmd(send_data);
		}
		else {
			$(this.terminal).one("terminal_ready", function(){
				self.debug_cmd(send_data);
			});
		}
		
		$(debug_module).off("value_changed");
		$(debug_module).on("value_changed",function(e, data){
			self.terminal.send_command("p "+data.variable+"="+data.value+"\r", self.prompt);
		});
		
		$(debug_module).off("debug_end");
		$(debug_module).on("debug_end",function(){
			table_variable.initializeTable();
			table_variable.refreshView();
			
			// clear highlight lines
			var windows = core.module.layout.workspace.window_manager.window;
			for (var i in windows) {
				var window = windows[i];
				if (window.project == self.current_debug_project) {
					window.editor && window.editor.clear_highlight();
				}
			}
			
			setTimeout(function(){
				self.debug_cmd({mode:'terminate'});
			}, 500);
		});
		*/
	},
	
	/*
	 * 디버깅 명령어 전송
	 */
	debug_cmd: function (cmd) {
		/*
		 * cmd = { mode, project_path }
		 */
		/*
		var self=this;
		var property = core.property.plugins['org.goorm.plugin.go'];
		var table_variable = core.module.debug.table_variable;
		
		var mainPath = property['plugin.go.main'];
		var buildPath = property['plugin.go.build_path'];
		
		if(this.terminal === null) {
			console.log("no connection!");
			return ;
		}
		
		switch (cmd.mode) {
		case 'init':
			self.terminal.flush_command_queue();
			self.terminal.send_command("gdb "+buildPath+mainPath+" --quiet\r", null);
			self.set_breakpoints();
			self.terminal.send_command("run\r", self.prompt, function(){
				self.debug_get_status();
			});
			break;
		case 'continue':
			self.set_breakpoints();
			self.terminal.send_command("continue\r", self.prompt, function(){
				self.debug_get_status();
			}); break;
		case 'terminate':
			self.terminal.flush_command_queue();
			self.terminal.send_command("quit\r", self.prompt);
			setTimeout(function(){
				self.terminal.send_command("y\r", /(Exit|Quit) anyway\?/);
				self.terminal.flush_command_queue();
			}, 500);
			table_variable.initializeTable();
			table_variable.refreshView();
			
			// clear highlight lines
			var windows = core.module.layout.workspace.window_manager.window;
			for (var i in windows) {
				var window = windows[i];
				if (window.project == self.current_debug_project) {
					window.editor && window.editor.clear_highlight();
				}
			}
			
			break;
		case 'step_over':
			self.set_breakpoints();
			self.terminal.send_command("next\r", self.prompt, function(){
				self.debug_get_status();
			}); break;
		case 'step_in':
			self.set_breakpoints();
			self.terminal.send_command("step\r", self.prompt, function(){
				self.debug_get_status();
			}); break;
		case 'step_out':
			self.set_breakpoints();
			self.terminal.send_command("finish\r", self.prompt, function(){
				self.debug_get_status();
			}); break;
		default : break;
		}
		*/
	},
	
	debug_get_status: function(){
		var self = this;
		this.terminal.send_command("where\r", this.prompt, function(terminal_data){
			self.set_currentline(terminal_data);
		});
		this.terminal.send_command("info locals\r", this.prompt, function(terminal_data){
			self.set_debug_variable(terminal_data);
		});
	},
	
	set_currentline: function(terminal_data){
		var self = this;
		var lines = terminal_data.split('\n');
		
		// clear highlight lines
		var windows = core.module.layout.workspace.window_manager.window;
		for (var i in windows) {
			var window = windows[i];
			if (window.project == self.current_debug_project) {
				window.editor && window.editor.clear_highlight();
			}
		}
		
		$.each(lines, function(i, line){
			if(line == '') return;
			// 현재 라인 처리
			var regex = /#0.*at ((.*)\/)?(.*):(\d+)/;
			if(regex.test(line)) {
				var match = line.match(regex);
				var filepath = match[2];
				var filename = match[3];
				var line_number = match[4];

				var windows = core.module.layout.workspace.window_manager.window;
				for (var j=0; j<windows.length; j++) {
					var window = windows[j];
					if (window.project == self.current_debug_project 
							&& window.filename == filename){
						if(filepath && window.filepath.search(self.current_debug_project+"/"+filepath+"/") > -1) {
							window.editor.highlight_line(line_number);
						}
						else if (!filepath) {
							window.editor.highlight_line(line_number);
						}
					}
				}
			}
		});
	},
	
	set_debug_variable: function(terminal_data){
		var lines = terminal_data.split('\n');
		var table_variable = core.module.debug.table_variable;
		
		table_variable.initializeTable();
		$.each(lines, function(i, line){
			if(line == '') return;
			
			// local variable 추가
			var variable = line.split(' = ');
			if (variable.length == 2) {
				table_variable.addRow({
					"variable": variable[0].trim(),
					"value": variable[1].trim()
				});
			}
		});
		table_variable.refreshView();
	},
	
	set_breakpoints: function(){
		var self = this;
		var windows = core.module.layout.workspace.window_manager.window;
		for (var i in windows) {
			var window = windows[i];
			if (window.project == this.current_debug_project) {
				var filename = window.filename;
				
				if(!window.editor) continue;				
				var breakpoints = window.editor.breakpoints;
				if(breakpoints.length > 0){
					self.terminal.send_command('clear\r', self.prompt);
					
					for(var i=0; i < breakpoints.length; i++) {
						var breakpoint = breakpoints[i];
						breakpoint += 1;
						breakpoint = filename+":"+breakpoint;
						self.terminal.send_command("break "+breakpoint+"\r", self.prompt);
					}
				}
				else {
					// no breakpoints
				}
			}
		}
	},
	
	build: function (projectName, callback) {
		var self=this;
		var workspace = core.preference.workspace_path;
		var property = core.property;
		if(projectName) {
			core.workspace[projectName] && (property = core.workspace[projectName])
		}
		else {
			var projectName = core.status.current_project_path;
		}
		var plugin = property.plugins['org.goorm.plugin.go'];
		var buildOptions = " "+plugin['plugin.go.build_option'];
		var buildPath = " -o "+workspace+projectName+"/"+plugin['plugin.go.build_path']+plugin['plugin.go.main'];
		
		var cmd = 'cd '+workspace+projectName+"/"+plugin['plugin.go.source_path'];
		var cmd1 = "go build"+buildPath+buildOptions;
		var cmd2 = 'cd '+workspace+projectName;
		
		core.module.layout.terminal.send_command(cmd+'\r', null, function(){
			core.module.layout.terminal.send_command(cmd1+'\r', null, function(){
				core.module.layout.project_explorer.refresh();
				core.module.layout.terminal.send_command(cmd2+'\r', null);
			});
		});
		
		if(callback) callback();
	},
	
	clean: function(project_name){
		var workspace = core.preference.workspace_path;
		var property = core.property;
		if(project_name) {
			core.workspace[project_name] && (property = core.workspace[project_name])
		}
		else {
			var project_name = core.status.current_project_path;
		}
		var plugin = property.plugins['org.goorm.plugin.go'];
		var buildPath = plugin['plugin.go.build_path'];
		core.module.layout.terminal.send_command("rm -rf "+workspace+project_name+"/"+buildPath+"* \r", null, function(){
			core.module.layout.project_explorer.refresh();
		});
	}
};