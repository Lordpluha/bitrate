'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">@spotify/api documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AlbumsModule.html" data-type="entity-link" >AlbumsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AlbumsModule-986e5567bbb92a27629cf465a88f608bf60eacc3fff6233526dd7f54648674c4a63fd301963ca3621a00a41a526186e46a5fee4df21320100c0131d8f1014fe2"' : 'data-bs-target="#xs-controllers-links-module-AlbumsModule-986e5567bbb92a27629cf465a88f608bf60eacc3fff6233526dd7f54648674c4a63fd301963ca3621a00a41a526186e46a5fee4df21320100c0131d8f1014fe2"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AlbumsModule-986e5567bbb92a27629cf465a88f608bf60eacc3fff6233526dd7f54648674c4a63fd301963ca3621a00a41a526186e46a5fee4df21320100c0131d8f1014fe2"' :
                                            'id="xs-controllers-links-module-AlbumsModule-986e5567bbb92a27629cf465a88f608bf60eacc3fff6233526dd7f54648674c4a63fd301963ca3621a00a41a526186e46a5fee4df21320100c0131d8f1014fe2"' }>
                                            <li class="link">
                                                <a href="controllers/AlbumsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AlbumsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AlbumsModule-986e5567bbb92a27629cf465a88f608bf60eacc3fff6233526dd7f54648674c4a63fd301963ca3621a00a41a526186e46a5fee4df21320100c0131d8f1014fe2"' : 'data-bs-target="#xs-injectables-links-module-AlbumsModule-986e5567bbb92a27629cf465a88f608bf60eacc3fff6233526dd7f54648674c4a63fd301963ca3621a00a41a526186e46a5fee4df21320100c0131d8f1014fe2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AlbumsModule-986e5567bbb92a27629cf465a88f608bf60eacc3fff6233526dd7f54648674c4a63fd301963ca3621a00a41a526186e46a5fee4df21320100c0131d8f1014fe2"' :
                                        'id="xs-injectables-links-module-AlbumsModule-986e5567bbb92a27629cf465a88f608bf60eacc3fff6233526dd7f54648674c4a63fd301963ca3621a00a41a526186e46a5fee4df21320100c0131d8f1014fe2"' }>
                                        <li class="link">
                                            <a href="injectables/AlbumsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AlbumsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-8d884f7c485b274f8fca117dc558bff26ba55a1ee0975919399d794a183abdf9049a54acc0049ad664def03c13dcc8412ea96bda2a06ad3ac25f17b818b22c5e"' : 'data-bs-target="#xs-controllers-links-module-AppModule-8d884f7c485b274f8fca117dc558bff26ba55a1ee0975919399d794a183abdf9049a54acc0049ad664def03c13dcc8412ea96bda2a06ad3ac25f17b818b22c5e"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-8d884f7c485b274f8fca117dc558bff26ba55a1ee0975919399d794a183abdf9049a54acc0049ad664def03c13dcc8412ea96bda2a06ad3ac25f17b818b22c5e"' :
                                            'id="xs-controllers-links-module-AppModule-8d884f7c485b274f8fca117dc558bff26ba55a1ee0975919399d794a183abdf9049a54acc0049ad664def03c13dcc8412ea96bda2a06ad3ac25f17b818b22c5e"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ArtistsModule.html" data-type="entity-link" >ArtistsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ArtistsModule-85c89371da24d32c79d4d4baf00d1794b9192a967675c34860e2fe0921e53343a8adcfe6deaac29ad5fab5db19b77491f3541283f9fed10895164a697860f0a4"' : 'data-bs-target="#xs-controllers-links-module-ArtistsModule-85c89371da24d32c79d4d4baf00d1794b9192a967675c34860e2fe0921e53343a8adcfe6deaac29ad5fab5db19b77491f3541283f9fed10895164a697860f0a4"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ArtistsModule-85c89371da24d32c79d4d4baf00d1794b9192a967675c34860e2fe0921e53343a8adcfe6deaac29ad5fab5db19b77491f3541283f9fed10895164a697860f0a4"' :
                                            'id="xs-controllers-links-module-ArtistsModule-85c89371da24d32c79d4d4baf00d1794b9192a967675c34860e2fe0921e53343a8adcfe6deaac29ad5fab5db19b77491f3541283f9fed10895164a697860f0a4"' }>
                                            <li class="link">
                                                <a href="controllers/ArtistsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ArtistsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ArtistsModule-85c89371da24d32c79d4d4baf00d1794b9192a967675c34860e2fe0921e53343a8adcfe6deaac29ad5fab5db19b77491f3541283f9fed10895164a697860f0a4"' : 'data-bs-target="#xs-injectables-links-module-ArtistsModule-85c89371da24d32c79d4d4baf00d1794b9192a967675c34860e2fe0921e53343a8adcfe6deaac29ad5fab5db19b77491f3541283f9fed10895164a697860f0a4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ArtistsModule-85c89371da24d32c79d4d4baf00d1794b9192a967675c34860e2fe0921e53343a8adcfe6deaac29ad5fab5db19b77491f3541283f9fed10895164a697860f0a4"' :
                                        'id="xs-injectables-links-module-ArtistsModule-85c89371da24d32c79d4d4baf00d1794b9192a967675c34860e2fe0921e53343a8adcfe6deaac29ad5fab5db19b77491f3541283f9fed10895164a697860f0a4"' }>
                                        <li class="link">
                                            <a href="injectables/ArtistsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ArtistsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-eee2d910a87af0c283b82522b6d2304345c695d33271f45c45a219db63451a4c28a26918a89190908dc49f98452a01a5c1c497a44b1e48edf4648d9063b8ffb4"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-eee2d910a87af0c283b82522b6d2304345c695d33271f45c45a219db63451a4c28a26918a89190908dc49f98452a01a5c1c497a44b1e48edf4648d9063b8ffb4"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-eee2d910a87af0c283b82522b6d2304345c695d33271f45c45a219db63451a4c28a26918a89190908dc49f98452a01a5c1c497a44b1e48edf4648d9063b8ffb4"' :
                                            'id="xs-controllers-links-module-AuthModule-eee2d910a87af0c283b82522b6d2304345c695d33271f45c45a219db63451a4c28a26918a89190908dc49f98452a01a5c1c497a44b1e48edf4648d9063b8ffb4"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-eee2d910a87af0c283b82522b6d2304345c695d33271f45c45a219db63451a4c28a26918a89190908dc49f98452a01a5c1c497a44b1e48edf4648d9063b8ffb4"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-eee2d910a87af0c283b82522b6d2304345c695d33271f45c45a219db63451a4c28a26918a89190908dc49f98452a01a5c1c497a44b1e48edf4648d9063b8ffb4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-eee2d910a87af0c283b82522b6d2304345c695d33271f45c45a219db63451a4c28a26918a89190908dc49f98452a01a5c1c497a44b1e48edf4648d9063b8ffb4"' :
                                        'id="xs-injectables-links-module-AuthModule-eee2d910a87af0c283b82522b6d2304345c695d33271f45c45a219db63451a4c28a26918a89190908dc49f98452a01a5c1c497a44b1e48edf4648d9063b8ffb4"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TokenService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TokenService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PlaylistsModule.html" data-type="entity-link" >PlaylistsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PlaylistsModule-8fe0a8a6dee785df25676836c79f061914e12782e8ef370d2b52208f979290ece15c3e6cf57c1109ae1b3449c1f0cd5343efcbc19693dda67fef078e80e009d1"' : 'data-bs-target="#xs-controllers-links-module-PlaylistsModule-8fe0a8a6dee785df25676836c79f061914e12782e8ef370d2b52208f979290ece15c3e6cf57c1109ae1b3449c1f0cd5343efcbc19693dda67fef078e80e009d1"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PlaylistsModule-8fe0a8a6dee785df25676836c79f061914e12782e8ef370d2b52208f979290ece15c3e6cf57c1109ae1b3449c1f0cd5343efcbc19693dda67fef078e80e009d1"' :
                                            'id="xs-controllers-links-module-PlaylistsModule-8fe0a8a6dee785df25676836c79f061914e12782e8ef370d2b52208f979290ece15c3e6cf57c1109ae1b3449c1f0cd5343efcbc19693dda67fef078e80e009d1"' }>
                                            <li class="link">
                                                <a href="controllers/PlaylistsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PlaylistsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PlaylistsModule-8fe0a8a6dee785df25676836c79f061914e12782e8ef370d2b52208f979290ece15c3e6cf57c1109ae1b3449c1f0cd5343efcbc19693dda67fef078e80e009d1"' : 'data-bs-target="#xs-injectables-links-module-PlaylistsModule-8fe0a8a6dee785df25676836c79f061914e12782e8ef370d2b52208f979290ece15c3e6cf57c1109ae1b3449c1f0cd5343efcbc19693dda67fef078e80e009d1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PlaylistsModule-8fe0a8a6dee785df25676836c79f061914e12782e8ef370d2b52208f979290ece15c3e6cf57c1109ae1b3449c1f0cd5343efcbc19693dda67fef078e80e009d1"' :
                                        'id="xs-injectables-links-module-PlaylistsModule-8fe0a8a6dee785df25676836c79f061914e12782e8ef370d2b52208f979290ece15c3e6cf57c1109ae1b3449c1f0cd5343efcbc19693dda67fef078e80e009d1"' }>
                                        <li class="link">
                                            <a href="injectables/PlaylistsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PlaylistsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PrismaModule.html" data-type="entity-link" >PrismaModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PrismaModule-b450d622665d914bb7a48e2013c30446d3b4c970c9c681d1f192f1aa5793e66fc7639a4edd40909bac6a4ab0b1f2e4338fdab3d4184c82f8c1ffcab33ce4f6b5"' : 'data-bs-target="#xs-injectables-links-module-PrismaModule-b450d622665d914bb7a48e2013c30446d3b4c970c9c681d1f192f1aa5793e66fc7639a4edd40909bac6a4ab0b1f2e4338fdab3d4184c82f8c1ffcab33ce4f6b5"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PrismaModule-b450d622665d914bb7a48e2013c30446d3b4c970c9c681d1f192f1aa5793e66fc7639a4edd40909bac6a4ab0b1f2e4338fdab3d4184c82f8c1ffcab33ce4f6b5"' :
                                        'id="xs-injectables-links-module-PrismaModule-b450d622665d914bb7a48e2013c30446d3b4c970c9c681d1f192f1aa5793e66fc7639a4edd40909bac6a4ab0b1f2e4338fdab3d4184c82f8c1ffcab33ce4f6b5"' }>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TracksModule.html" data-type="entity-link" >TracksModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-TracksModule-e0a93e6305fe233ac66e716c1ff769fa713b837dd791bbf96b79f458553b442bb2dbc1b41ead1bb0344445406c3009b9469a47287eeb383ea941e87deecc617d"' : 'data-bs-target="#xs-controllers-links-module-TracksModule-e0a93e6305fe233ac66e716c1ff769fa713b837dd791bbf96b79f458553b442bb2dbc1b41ead1bb0344445406c3009b9469a47287eeb383ea941e87deecc617d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-TracksModule-e0a93e6305fe233ac66e716c1ff769fa713b837dd791bbf96b79f458553b442bb2dbc1b41ead1bb0344445406c3009b9469a47287eeb383ea941e87deecc617d"' :
                                            'id="xs-controllers-links-module-TracksModule-e0a93e6305fe233ac66e716c1ff769fa713b837dd791bbf96b79f458553b442bb2dbc1b41ead1bb0344445406c3009b9469a47287eeb383ea941e87deecc617d"' }>
                                            <li class="link">
                                                <a href="controllers/TracksController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TracksController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TracksModule-e0a93e6305fe233ac66e716c1ff769fa713b837dd791bbf96b79f458553b442bb2dbc1b41ead1bb0344445406c3009b9469a47287eeb383ea941e87deecc617d"' : 'data-bs-target="#xs-injectables-links-module-TracksModule-e0a93e6305fe233ac66e716c1ff769fa713b837dd791bbf96b79f458553b442bb2dbc1b41ead1bb0344445406c3009b9469a47287eeb383ea941e87deecc617d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TracksModule-e0a93e6305fe233ac66e716c1ff769fa713b837dd791bbf96b79f458553b442bb2dbc1b41ead1bb0344445406c3009b9469a47287eeb383ea941e87deecc617d"' :
                                        'id="xs-injectables-links-module-TracksModule-e0a93e6305fe233ac66e716c1ff769fa713b837dd791bbf96b79f458553b442bb2dbc1b41ead1bb0344445406c3009b9469a47287eeb383ea941e87deecc617d"' }>
                                        <li class="link">
                                            <a href="injectables/TracksService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TracksService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersModule-e19dd843901cdd29c403db1eeff163e20c52d3003312a1be2663c7c08f27315bf19958a8a3ca8b5ac21a0a45e790f2264e3c54f4b196586a9f64ebee8c787532"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-e19dd843901cdd29c403db1eeff163e20c52d3003312a1be2663c7c08f27315bf19958a8a3ca8b5ac21a0a45e790f2264e3c54f4b196586a9f64ebee8c787532"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-e19dd843901cdd29c403db1eeff163e20c52d3003312a1be2663c7c08f27315bf19958a8a3ca8b5ac21a0a45e790f2264e3c54f4b196586a9f64ebee8c787532"' :
                                            'id="xs-controllers-links-module-UsersModule-e19dd843901cdd29c403db1eeff163e20c52d3003312a1be2663c7c08f27315bf19958a8a3ca8b5ac21a0a45e790f2264e3c54f4b196586a9f64ebee8c787532"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-e19dd843901cdd29c403db1eeff163e20c52d3003312a1be2663c7c08f27315bf19958a8a3ca8b5ac21a0a45e790f2264e3c54f4b196586a9f64ebee8c787532"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-e19dd843901cdd29c403db1eeff163e20c52d3003312a1be2663c7c08f27315bf19958a8a3ca8b5ac21a0a45e790f2264e3c54f4b196586a9f64ebee8c787532"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-e19dd843901cdd29c403db1eeff163e20c52d3003312a1be2663c7c08f27315bf19958a8a3ca8b5ac21a0a45e790f2264e3c54f4b196586a9f64ebee8c787532"' :
                                        'id="xs-injectables-links-module-UsersModule-e19dd843901cdd29c403db1eeff163e20c52d3003312a1be2663c7c08f27315bf19958a8a3ca8b5ac21a0a45e790f2264e3c54f4b196586a9f64ebee8c787532"' }>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AlbumEntity.html" data-type="entity-link" >AlbumEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArtistEntity.html" data-type="entity-link" >ArtistEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/AudioGateway.html" data-type="entity-link" >AudioGateway</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateAlbumDto.html" data-type="entity-link" >CreateAlbumDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateArtistDto.html" data-type="entity-link" >CreateArtistDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreatePlaylistDto.html" data-type="entity-link" >CreatePlaylistDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateTrackDto.html" data-type="entity-link" >CreateTrackDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DownloadResourcesService.html" data-type="entity-link" >DownloadResourcesService</a>
                            </li>
                            <li class="link">
                                <a href="classes/FakerService.html" data-type="entity-link" >FakerService</a>
                            </li>
                            <li class="link">
                                <a href="classes/HttpExceptionFilter.html" data-type="entity-link" >HttpExceptionFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginDto.html" data-type="entity-link" >LoginDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PauseTrackDto.html" data-type="entity-link" >PauseTrackDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PlaylistEntity.html" data-type="entity-link" >PlaylistEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegistrationDto.html" data-type="entity-link" >RegistrationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SeedService.html" data-type="entity-link" >SeedService</a>
                            </li>
                            <li class="link">
                                <a href="classes/SessionEntity.html" data-type="entity-link" >SessionEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/StartTrackDto.html" data-type="entity-link" >StartTrackDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/TrackEntity.html" data-type="entity-link" >TrackEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateAlbumDto.html" data-type="entity-link" >UpdateAlbumDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdatePlaylistDto.html" data-type="entity-link" >UpdatePlaylistDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateStreamingDto.html" data-type="entity-link" >UpdateStreamingDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserDto.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UploadAvatarDto.html" data-type="entity-link" >UploadAvatarDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserEntity.html" data-type="entity-link" >UserEntity</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/PathTraversalMiddleware.html" data-type="entity-link" >PathTraversalMiddleware</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AuthGuard.html" data-type="entity-link" >AuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/WsAuthGuard.html" data-type="entity-link" >WsAuthGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AudioSocketEvents.html" data-type="entity-link" >AudioSocketEvents</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthenticatedSocket.html" data-type="entity-link" >AuthenticatedSocket</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PlayingSession.html" data-type="entity-link" >PlayingSession</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TrackPausedEvent.html" data-type="entity-link" >TrackPausedEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TrackPlayingEvent.html" data-type="entity-link" >TrackPlayingEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TrackStateEvent.html" data-type="entity-link" >TrackStateEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TrackUpdatedEvent.html" data-type="entity-link" >TrackUpdatedEvent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});