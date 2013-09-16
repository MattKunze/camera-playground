#import <Cordova/CDVPlugin.h>
#import "Captuvo.h"

//------------------------------------------------------------------------------
// plugin definition
//------------------------------------------------------------------------------
@interface CDVHoneywellScanner : CDVPlugin {}
- (void)trigger:(CDVInvokedUrlCommand*)command;
@end

//------------------------------------------------------------------------------
// plugin internals
//------------------------------------------------------------------------------
@implementation CDVHoneywellScanner

- (void)pluginInitialize {
    [super pluginInitialize];
    [[Captuvo sharedCaptuvoDevice]startDecoderHardware];
}

- (void)dispose {
    [[Captuvo sharedCaptuvoDevice]stopDecoderHardware];
    [super dispose];
}

//--------------------------------------------------------------------------
- (void)trigger:(CDVInvokedUrlCommand*)command {
    [[Captuvo sharedCaptuvoDevice]startDecoderScanning];
}

- (void)prompt:(NSString*) message {
    UIAlertView* alert = [[UIAlertView alloc] initWithTitle:@"Honeywell Scanner"
                                                    message:message
                                                   delegate:nil
                                          cancelButtonTitle:@"OK"
                                          otherButtonTitles:nil];
    [alert show];
}

@end

