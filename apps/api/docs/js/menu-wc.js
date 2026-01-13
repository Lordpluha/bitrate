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
        const tp = lithtml.html(`
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
                                            'data-bs-target="#controllers-links-module-AlbumsModule-7d6e8b7461df888dd030830d8477eb1bb589aeca5f06ee291512f7c91e9254ca075057e19aa2ca5c3aadb17123b9f32f13dd7494b213de55c78b010fd82bc5a9"' : 'data-bs-target="#xs-controllers-links-module-AlbumsModule-7d6e8b7461df888dd030830d8477eb1bb589aeca5f06ee291512f7c91e9254ca075057e19aa2ca5c3aadb17123b9f32f13dd7494b213de55c78b010fd82bc5a9"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AlbumsModule-7d6e8b7461df888dd030830d8477eb1bb589aeca5f06ee291512f7c91e9254ca075057e19aa2ca5c3aadb17123b9f32f13dd7494b213de55c78b010fd82bc5a9"' :
                                            'id="xs-controllers-links-module-AlbumsModule-7d6e8b7461df888dd030830d8477eb1bb589aeca5f06ee291512f7c91e9254ca075057e19aa2ca5c3aadb17123b9f32f13dd7494b213de55c78b010fd82bc5a9"' }>
                                            <li class="link">
                                                <a href="controllers/AlbumsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AlbumsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AlbumsModule-7d6e8b7461df888dd030830d8477eb1bb589aeca5f06ee291512f7c91e9254ca075057e19aa2ca5c3aadb17123b9f32f13dd7494b213de55c78b010fd82bc5a9"' : 'data-bs-target="#xs-injectables-links-module-AlbumsModule-7d6e8b7461df888dd030830d8477eb1bb589aeca5f06ee291512f7c91e9254ca075057e19aa2ca5c3aadb17123b9f32f13dd7494b213de55c78b010fd82bc5a9"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AlbumsModule-7d6e8b7461df888dd030830d8477eb1bb589aeca5f06ee291512f7c91e9254ca075057e19aa2ca5c3aadb17123b9f32f13dd7494b213de55c78b010fd82bc5a9"' :
                                        'id="xs-injectables-links-module-AlbumsModule-7d6e8b7461df888dd030830d8477eb1bb589aeca5f06ee291512f7c91e9254ca075057e19aa2ca5c3aadb17123b9f32f13dd7494b213de55c78b010fd82bc5a9"' }>
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
                                            'data-bs-target="#controllers-links-module-AppModule-ffcbb4d25bae881086a7d4fa195d1d5aeba15dc7282e75f2e5be98fd32a90190a71b5abd79816fe4588634ca301791ba142c6f08f970025da0794b7c44e2e318"' : 'data-bs-target="#xs-controllers-links-module-AppModule-ffcbb4d25bae881086a7d4fa195d1d5aeba15dc7282e75f2e5be98fd32a90190a71b5abd79816fe4588634ca301791ba142c6f08f970025da0794b7c44e2e318"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-ffcbb4d25bae881086a7d4fa195d1d5aeba15dc7282e75f2e5be98fd32a90190a71b5abd79816fe4588634ca301791ba142c6f08f970025da0794b7c44e2e318"' :
                                            'id="xs-controllers-links-module-AppModule-ffcbb4d25bae881086a7d4fa195d1d5aeba15dc7282e75f2e5be98fd32a90190a71b5abd79816fe4588634ca301791ba142c6f08f970025da0794b7c44e2e318"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-ffcbb4d25bae881086a7d4fa195d1d5aeba15dc7282e75f2e5be98fd32a90190a71b5abd79816fe4588634ca301791ba142c6f08f970025da0794b7c44e2e318"' : 'data-bs-target="#xs-injectables-links-module-AppModule-ffcbb4d25bae881086a7d4fa195d1d5aeba15dc7282e75f2e5be98fd32a90190a71b5abd79816fe4588634ca301791ba142c6f08f970025da0794b7c44e2e318"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-ffcbb4d25bae881086a7d4fa195d1d5aeba15dc7282e75f2e5be98fd32a90190a71b5abd79816fe4588634ca301791ba142c6f08f970025da0794b7c44e2e318"' :
                                        'id="xs-injectables-links-module-AppModule-ffcbb4d25bae881086a7d4fa195d1d5aeba15dc7282e75f2e5be98fd32a90190a71b5abd79816fe4588634ca301791ba142c6f08f970025da0794b7c44e2e318"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ArtistsModule.html" data-type="entity-link" >ArtistsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ArtistsModule-c3865d90386eda5c4ab9d21e9096bee883d14782a033bcc6cba3e9d9885131fec7963c0d1f145cc8ef61f8c06626ddbb85cca7f0334d7c19c75990562f911bea"' : 'data-bs-target="#xs-controllers-links-module-ArtistsModule-c3865d90386eda5c4ab9d21e9096bee883d14782a033bcc6cba3e9d9885131fec7963c0d1f145cc8ef61f8c06626ddbb85cca7f0334d7c19c75990562f911bea"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ArtistsModule-c3865d90386eda5c4ab9d21e9096bee883d14782a033bcc6cba3e9d9885131fec7963c0d1f145cc8ef61f8c06626ddbb85cca7f0334d7c19c75990562f911bea"' :
                                            'id="xs-controllers-links-module-ArtistsModule-c3865d90386eda5c4ab9d21e9096bee883d14782a033bcc6cba3e9d9885131fec7963c0d1f145cc8ef61f8c06626ddbb85cca7f0334d7c19c75990562f911bea"' }>
                                            <li class="link">
                                                <a href="controllers/ArtistsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ArtistsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ArtistsModule-c3865d90386eda5c4ab9d21e9096bee883d14782a033bcc6cba3e9d9885131fec7963c0d1f145cc8ef61f8c06626ddbb85cca7f0334d7c19c75990562f911bea"' : 'data-bs-target="#xs-injectables-links-module-ArtistsModule-c3865d90386eda5c4ab9d21e9096bee883d14782a033bcc6cba3e9d9885131fec7963c0d1f145cc8ef61f8c06626ddbb85cca7f0334d7c19c75990562f911bea"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ArtistsModule-c3865d90386eda5c4ab9d21e9096bee883d14782a033bcc6cba3e9d9885131fec7963c0d1f145cc8ef61f8c06626ddbb85cca7f0334d7c19c75990562f911bea"' :
                                        'id="xs-injectables-links-module-ArtistsModule-c3865d90386eda5c4ab9d21e9096bee883d14782a033bcc6cba3e9d9885131fec7963c0d1f145cc8ef61f8c06626ddbb85cca7f0334d7c19c75990562f911bea"' }>
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
                                            'data-bs-target="#controllers-links-module-AuthModule-d43a574bdd8d33c09e118c85be40b9395842532101a897c56e6cbbf1864e5d8f36a4708bade8cdf1f0ba387ac6ff510de3a4f277f7e12a46a46573f4c94b8391"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-d43a574bdd8d33c09e118c85be40b9395842532101a897c56e6cbbf1864e5d8f36a4708bade8cdf1f0ba387ac6ff510de3a4f277f7e12a46a46573f4c94b8391"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-d43a574bdd8d33c09e118c85be40b9395842532101a897c56e6cbbf1864e5d8f36a4708bade8cdf1f0ba387ac6ff510de3a4f277f7e12a46a46573f4c94b8391"' :
                                            'id="xs-controllers-links-module-AuthModule-d43a574bdd8d33c09e118c85be40b9395842532101a897c56e6cbbf1864e5d8f36a4708bade8cdf1f0ba387ac6ff510de3a4f277f7e12a46a46573f4c94b8391"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-d43a574bdd8d33c09e118c85be40b9395842532101a897c56e6cbbf1864e5d8f36a4708bade8cdf1f0ba387ac6ff510de3a4f277f7e12a46a46573f4c94b8391"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-d43a574bdd8d33c09e118c85be40b9395842532101a897c56e6cbbf1864e5d8f36a4708bade8cdf1f0ba387ac6ff510de3a4f277f7e12a46a46573f4c94b8391"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-d43a574bdd8d33c09e118c85be40b9395842532101a897c56e6cbbf1864e5d8f36a4708bade8cdf1f0ba387ac6ff510de3a4f277f7e12a46a46573f4c94b8391"' :
                                        'id="xs-injectables-links-module-AuthModule-d43a574bdd8d33c09e118c85be40b9395842532101a897c56e6cbbf1864e5d8f36a4708bade8cdf1f0ba387ac6ff510de3a4f277f7e12a46a46573f4c94b8391"' }>
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
                                <a href="modules/FilesModule.html" data-type="entity-link" >FilesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-FilesModule-f7816b39f7edbe2e96ce2df169fcf67869c7ae058f7cbd8bd9c22b7e96e3b2f0d504d336b9a46cd700e68ed63f333e374d9e8101d64a03ca4726737c5f4284e2"' : 'data-bs-target="#xs-controllers-links-module-FilesModule-f7816b39f7edbe2e96ce2df169fcf67869c7ae058f7cbd8bd9c22b7e96e3b2f0d504d336b9a46cd700e68ed63f333e374d9e8101d64a03ca4726737c5f4284e2"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-FilesModule-f7816b39f7edbe2e96ce2df169fcf67869c7ae058f7cbd8bd9c22b7e96e3b2f0d504d336b9a46cd700e68ed63f333e374d9e8101d64a03ca4726737c5f4284e2"' :
                                            'id="xs-controllers-links-module-FilesModule-f7816b39f7edbe2e96ce2df169fcf67869c7ae058f7cbd8bd9c22b7e96e3b2f0d504d336b9a46cd700e68ed63f333e374d9e8101d64a03ca4726737c5f4284e2"' }>
                                            <li class="link">
                                                <a href="controllers/FilesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FilesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-FilesModule-f7816b39f7edbe2e96ce2df169fcf67869c7ae058f7cbd8bd9c22b7e96e3b2f0d504d336b9a46cd700e68ed63f333e374d9e8101d64a03ca4726737c5f4284e2"' : 'data-bs-target="#xs-injectables-links-module-FilesModule-f7816b39f7edbe2e96ce2df169fcf67869c7ae058f7cbd8bd9c22b7e96e3b2f0d504d336b9a46cd700e68ed63f333e374d9e8101d64a03ca4726737c5f4284e2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-FilesModule-f7816b39f7edbe2e96ce2df169fcf67869c7ae058f7cbd8bd9c22b7e96e3b2f0d504d336b9a46cd700e68ed63f333e374d9e8101d64a03ca4726737c5f4284e2"' :
                                        'id="xs-injectables-links-module-FilesModule-f7816b39f7edbe2e96ce2df169fcf67869c7ae058f7cbd8bd9c22b7e96e3b2f0d504d336b9a46cd700e68ed63f333e374d9e8101d64a03ca4726737c5f4284e2"' }>
                                        <li class="link">
                                            <a href="injectables/FilesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FilesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PlaylistsModule.html" data-type="entity-link" >PlaylistsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PlaylistsModule-5c4a3729675a20335744f1ef50318b5c54fd42ed551d91111770c58159117703367439e09977b7ce13e5f8576b21fc27cd2562f84524f9b2a912e7cd043d8e96"' : 'data-bs-target="#xs-controllers-links-module-PlaylistsModule-5c4a3729675a20335744f1ef50318b5c54fd42ed551d91111770c58159117703367439e09977b7ce13e5f8576b21fc27cd2562f84524f9b2a912e7cd043d8e96"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PlaylistsModule-5c4a3729675a20335744f1ef50318b5c54fd42ed551d91111770c58159117703367439e09977b7ce13e5f8576b21fc27cd2562f84524f9b2a912e7cd043d8e96"' :
                                            'id="xs-controllers-links-module-PlaylistsModule-5c4a3729675a20335744f1ef50318b5c54fd42ed551d91111770c58159117703367439e09977b7ce13e5f8576b21fc27cd2562f84524f9b2a912e7cd043d8e96"' }>
                                            <li class="link">
                                                <a href="controllers/PlaylistsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PlaylistsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PlaylistsModule-5c4a3729675a20335744f1ef50318b5c54fd42ed551d91111770c58159117703367439e09977b7ce13e5f8576b21fc27cd2562f84524f9b2a912e7cd043d8e96"' : 'data-bs-target="#xs-injectables-links-module-PlaylistsModule-5c4a3729675a20335744f1ef50318b5c54fd42ed551d91111770c58159117703367439e09977b7ce13e5f8576b21fc27cd2562f84524f9b2a912e7cd043d8e96"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PlaylistsModule-5c4a3729675a20335744f1ef50318b5c54fd42ed551d91111770c58159117703367439e09977b7ce13e5f8576b21fc27cd2562f84524f9b2a912e7cd043d8e96"' :
                                        'id="xs-injectables-links-module-PlaylistsModule-5c4a3729675a20335744f1ef50318b5c54fd42ed551d91111770c58159117703367439e09977b7ce13e5f8576b21fc27cd2562f84524f9b2a912e7cd043d8e96"' }>
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
                                <a href="modules/TemplatePlaygroundModule.html" data-type="entity-link" >TemplatePlaygroundModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' : 'data-bs-target="#xs-components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' :
                                            'id="xs-components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                            <li class="link">
                                                <a href="components/TemplatePlaygroundComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TemplatePlaygroundComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' : 'data-bs-target="#xs-injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' :
                                        'id="xs-injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                        <li class="link">
                                            <a href="injectables/HbsRenderService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HbsRenderService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TemplateEditorService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TemplateEditorService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ZipExportService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ZipExportService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TracksModule.html" data-type="entity-link" >TracksModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-TracksModule-a60cde091bacf5eee71a669ae523878c10792fdad894cc74e88aff3f3d7e19e4306a30ea85672bd8fe9e49e19e615e094ecd90bac44d881a06681dd81f264e69"' : 'data-bs-target="#xs-controllers-links-module-TracksModule-a60cde091bacf5eee71a669ae523878c10792fdad894cc74e88aff3f3d7e19e4306a30ea85672bd8fe9e49e19e615e094ecd90bac44d881a06681dd81f264e69"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-TracksModule-a60cde091bacf5eee71a669ae523878c10792fdad894cc74e88aff3f3d7e19e4306a30ea85672bd8fe9e49e19e615e094ecd90bac44d881a06681dd81f264e69"' :
                                            'id="xs-controllers-links-module-TracksModule-a60cde091bacf5eee71a669ae523878c10792fdad894cc74e88aff3f3d7e19e4306a30ea85672bd8fe9e49e19e615e094ecd90bac44d881a06681dd81f264e69"' }>
                                            <li class="link">
                                                <a href="controllers/TracksController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TracksController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TracksModule-a60cde091bacf5eee71a669ae523878c10792fdad894cc74e88aff3f3d7e19e4306a30ea85672bd8fe9e49e19e615e094ecd90bac44d881a06681dd81f264e69"' : 'data-bs-target="#xs-injectables-links-module-TracksModule-a60cde091bacf5eee71a669ae523878c10792fdad894cc74e88aff3f3d7e19e4306a30ea85672bd8fe9e49e19e615e094ecd90bac44d881a06681dd81f264e69"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TracksModule-a60cde091bacf5eee71a669ae523878c10792fdad894cc74e88aff3f3d7e19e4306a30ea85672bd8fe9e49e19e615e094ecd90bac44d881a06681dd81f264e69"' :
                                        'id="xs-injectables-links-module-TracksModule-a60cde091bacf5eee71a669ae523878c10792fdad894cc74e88aff3f3d7e19e4306a30ea85672bd8fe9e49e19e615e094ecd90bac44d881a06681dd81f264e69"' }>
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
                                            'data-bs-target="#controllers-links-module-UsersModule-c415b60549e4f8c1894e2357648c479d562006fbf233d632bbb3cd9756031920df5471edc0ccb112f38d75fc63bf53e760533ad6833956f549f23c8dd65386d0"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-c415b60549e4f8c1894e2357648c479d562006fbf233d632bbb3cd9756031920df5471edc0ccb112f38d75fc63bf53e760533ad6833956f549f23c8dd65386d0"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-c415b60549e4f8c1894e2357648c479d562006fbf233d632bbb3cd9756031920df5471edc0ccb112f38d75fc63bf53e760533ad6833956f549f23c8dd65386d0"' :
                                            'id="xs-controllers-links-module-UsersModule-c415b60549e4f8c1894e2357648c479d562006fbf233d632bbb3cd9756031920df5471edc0ccb112f38d75fc63bf53e760533ad6833956f549f23c8dd65386d0"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-c415b60549e4f8c1894e2357648c479d562006fbf233d632bbb3cd9756031920df5471edc0ccb112f38d75fc63bf53e760533ad6833956f549f23c8dd65386d0"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-c415b60549e4f8c1894e2357648c479d562006fbf233d632bbb3cd9756031920df5471edc0ccb112f38d75fc63bf53e760533ad6833956f549f23c8dd65386d0"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-c415b60549e4f8c1894e2357648c479d562006fbf233d632bbb3cd9756031920df5471edc0ccb112f38d75fc63bf53e760533ad6833956f549f23c8dd65386d0"' :
                                        'id="xs-injectables-links-module-UsersModule-c415b60549e4f8c1894e2357648c479d562006fbf233d632bbb3cd9756031920df5471edc0ccb112f38d75fc63bf53e760533ad6833956f549f23c8dd65386d0"' }>
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
                                <a href="interfaces/CompoDocConfig.html" data-type="entity-link" >CompoDocConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PlayingSession.html" data-type="entity-link" >PlayingSession</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Session.html" data-type="entity-link" >Session</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Template.html" data-type="entity-link" >Template</a>
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