enyo.kind({

	name: "wTerm",
	kind: enyo.VFlexBox,
	align: 'center',
	
	published: {        
	    launchParams: null,
	},
	
	showVKB: false,

	components: [
		{
			kind: "ApplicationEvents",
			onWindowRotated: "setup",
			onKeydown: "onBtKeyDown",
			onWindowActivated: 'windowActivated',
			onWindowDeactivated: 'windowDeactivated',
			onApplicationRelaunch: "applicationRelaunchHandler",
			//onLoad:"loadHandler"
		},
		{
			kind: 'Popup2',
			name: 'about',
			scrim: true,
			components: [
				{style: 'text-align: center; padding-bottom: 6px; font-size: 120%;', allowHtml: true, content: '<img src="images/icon-64.png"/ style="vertical-align: middle; padding-right: 1em;"><b><u>wTerm v'+enyo.fetchAppInfo().version+'</u></b>'},
				{style: 'padding: 4px; text-align: center; font-size: 90%', content: '<a href="https://github.com/PuffTheMagic/wTerm">Project Home</a>'},
				{style: 'padding: 4px; text-align: center; font-size: 90%', content: '<a href="https://github.com/PuffTheMagic/wTerm/issues">Issues</a>'},
				{style: 'padding: 4px; text-align: center; font-size: 90%', content: '<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VU4L7VTGSR5C2">Donate</a>'},
				{style: 'text-align: center; padding-top: 24px; font-style: italic; font-size: 60%', allowHtml: true, content: '&copy; 2011-2012 WebOS Internals'}
			]
		},
		{
			kind: 'Popup2',
			name: 'launchWarning',
			modal: true,
			scrim: true,
			autoClose: false,
			dismissWithClick: false,
			components: [
				{style: 'text-align: center; padding-bottom: 12px; font-size: 120%;', allowHtml: true, content: '<b><u>Notice!</u></b>'},
				{name: 'warninig', allowHtml: true, content: 'Another application is trying to run the following command(s):'},
				{name: 'command', allowHtml: true, style: 'font-family: monospace; padding-left: 1em; padding-bottom: 1em'},
				{kind: 'HFlexBox', components: [
					{kind: 'HFlexBox', flex: 2, align: 'center', components: [
						{kind: "CheckBox", name: 'launchParamsCheckbox', onChange: 'launchParamWarn'},
						{style: 'font-size: 80%; padding-left: 1em;', content: 'Do not show this warning again.'},
					]},
					{kind: 'HFlexBox', flex: 1, components: [
						{kind: 'Button', flex: 1, className: 'enyo-button-negative', content: 'Cancel', onclick: 'warningCancel'},
						{kind: 'Button', flex: 1, className: 'enyo-button-affirmative ', content: 'Ok', onclick: 'warningOk'},
					]}
				]}				
			]
		},
		{
			kind: 'Popup2',
			name: 'warningwarning',
			modal: true,
			scrim: true,
			dismissWithClick: true,
			components: [
				{style: 'text-align: center; padding-bottom: 12px; font-size: 120%;', allowHtml: true, content: '<b><u>Warning!</u></b>'},
				{allowHtml: true, style: 'text-align: center', content: 'Enabling this option will allow any trojan or virus to execute<br>destructive commands on your device without your knowledge!'},
			]
		}
	],
	launchParamWarn: function() {
		enyo.application.prefs.set('launchParamsOK', this.$.launchParamsCheckbox.checked)
		if (this.$.launchParamsCheckbox.checked)
			this.$.warningwarning.openAtTopCenter()
	},
	warningCancel: function() {
		this.$.launchWarning.close()
		window.close()
	},
	warningOk: function() {
		this.$.launchWarning.close()
		this.$.terminal.inject(this.launchParams.command)
	},
		
	newTerm: function(inSender, inEvent, params, reactivate) {
		var delay = 0
		if (reactivate) {
			enyo.windows.activateWindow(enyo.windows.getRootWindow(), null)
			delay = 100
		}
		var f = function() {enyo.windows.openWindow("index.html", null, params)}
		enyo.job('new', f, delay)
	},
	
    applicationRelaunchHandler: function(inSender) {
        var params = enyo.windowParams
        if (params.dontLaunch) return true
        this.newTerm(null, null, params, true)
		return true;
    },
	
	windowActivated: function() {
		this.$.terminal.setActive(1)
		if (this.launchParams.dockMode)
			this.$.terminal.inject('\x11')
	},
	windowDeactivated: function() {
		this.$.terminal.setActive(0)
		if (this.launchParams.dockMode)
			this.$.terminal.inject('\x13')
	},
	
	initComponents: function() {
  		this.inherited(arguments)
  		this.createComponent({
			name : "getPreferencesCall",
			kind : "PalmService",
			service : "palm://com.palm.systemservice/",
			method : "getPreferences",
			onSuccess : "prefCallSuccess",
		})
		if (this.launchParams.dockMode) {
			this.createComponent({
    		name: 'terminal',
				kind: 'Terminal',
				bgcolor: '000000',
				width: window.innerWidth,
				height: window.innerHeight,
				onPluginReady: 'pluginReady',
				exec: '/media/cryptofs/apps/usr/palm/applications/us.ryanhope.wterm/bin/cmatrix'
			})
			enyo.setFullScreen(true)
		} else {
			this.showVKB = enyo.application.prefs.get('showVKB')
			this.createComponent({
				name: "prefs", 
				kind: "Preferences", 
				style: "width: 320px; top: 0px; bottom: 0; margin-bottom: 0px;", //width: 384px
				className: "enyo-bg",
				flyInFrom: "right",
				onOpen: "pulloutToggle",
				onClose: "closeRightPullout"
			})
			this.createComponent({
    		name: 'terminal',
				kind: 'Terminal',
				bgcolor: '000000',
				width: window.innerWidth,
				height: 400,
				onPluginReady: 'pluginReady',
				exec: enyo.application.prefs.get('exec')
			})
			this.createComponent({kind: 'vkb', name: 'vkb', terminal: this.$.terminal, showing: true})
			this.$.terminal.vkb = this.$.vkb
			this.$.prefs.terminal = this.$.terminal
			this.$.prefs.vkb = this.$.vkb
			this.createComponent({
				kind: "AppMenu", components: [
					{caption: "New Terminal", onclick: "newTerm"},
					{caption: "Preferences", onclick: "openPrefs"},
					{name: 'vkbToggle', caption: this.getVKBMenuText(), onclick: 'toggleVKB'},
					{caption: "About", onclick: "openAbout"}
				]
			})
		}
		this.setup()
	},
	
	pluginReady: function() {
		if (this.launchParams.command) {
			if (enyo.application.prefs.get('launchParamsOK')) {
				this.$.terminal.inject(this.launchParams.command)
			} else {
				this.$.launchWarning.openAtTopCenter()
				this.$.command.setContent(this.launchParams.command)
			}
		}
	},

	prefCallSuccess: function(inSender, inResponse) {
		switch (inResponse.rotationLock)
		{
			case 0:  // not locked
				break;
			case 3: // up
			case 4: // down
				if (!this.launchParams.dockMode)
					this.$.vkb.large()
				if (this.showVKB)
					this.$.terminal.resize(window.innerWidth, 400)
				else
					this.$.terminal.resize(window.innerWidth, window.innerHeight)
				break;
			case 5: // left
			case 6: // right
				if (!this.launchParams.dockMode)
					this.$.vkb.small()
				if (this.showVKB)
					this.$.terminal.resize(window.innerWidth, 722)
				else
					this.$.terminal.resize(window.innerWidth, window.innerHeight)
				break;
			default:
				break;
		}
	},
	
	getVKBMenuText: function() {
		return this.showVKB ? 'Hide Virtual Keyboard' : 'Show Virtual Keyboard'
	},
	
	setVKBMenu: function() {
		this.$.vkbToggle.setCaption(this.getVKBMenuText())
	},

	toggleVKB: function() {
		this.showVKB = !this.showVKB
		enyo.application.prefs.set('showVKB', this.showVKB)
		this.setVKBMenu()
		this.setup()
	},

	openAbout: function() {
		this.$.about.openAtTopCenter()
	},

	openPrefs: function() {
		//this.$.preferences.openAtTopCenter()
		if (this.$.prefs.showing)
			this.$.prefs.close();
		else {
			//this.$.messages.hasNode();
			//this.$.prefs.domStyles['height'] = this.$.messages.node.clientHeight + 'px';
			this.$.prefs.open();
			//this.$.nicks.render();
		}
	},
	
	setup: function() {
		var o = enyo.getWindowOrientation()
		if (o == 'up' || o == 'down') {
			if (!this.launchParams.dockMode)
				this.$.vkb.large()
			if (this.showVKB)
				this.$.terminal.resize(window.innerWidth, 400)
			else
				this.$.terminal.resize(window.innerWidth, window.innerHeight)
		} else {
			if (!this.launchParams.dockMode)
				this.$.vkb.small()
			if (this.showVKB)
				this.$.terminal.resize(window.innerWidth, 722)
			else
				this.$.terminal.resize(window.innerWidth, window.innerHeight)
		}

		// fix the keyboard if orientation is locked
		this.$.getPreferencesCall.call({"keys":["rotationLock"]});
	},

	onBtKeyDown: function(context, event) {
		if (this.$.terminal.$.plugin.hasNode())
		{
			this.$.terminal.$.plugin.node.focus();
			this.$.terminal.$.plugin.node.dispatchEvent(event);
		}
	},
	
	startDockmode: function() {
		enyo.setFullScreen(true)
	},
	
	loadHandler: function() {
		if (enyo.windowParams.dockMode) {
			this.startDockMode()
		}
	}

})
