/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.project._new.dialog = function () {
	this.dialog = null;
};

org.goorm.core.project._new.dialog.prototype = {
	init: function (option) {
		this.dialog = new org.goorm.core.dialog.wizard();
		this.dialog.init(option);
		
		return this;
	}
};