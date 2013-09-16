#import <Cordova/CDVPlugin.h>
#import "Captuvo.h"

//------------------------------------------------------------------------------
// plugin definition
//------------------------------------------------------------------------------
@interface CDVHoneywellScanner : CDVPlugin <CaptuvoEventsProtocol>
@property (nonatomic, retain) NSString* dataCallback;
- (void)registerCallback:(CDVInvokedUrlCommand*)command;
- (void)trigger:(CDVInvokedUrlCommand*)command;
@end

//------------------------------------------------------------------------------
// plugin internals
//------------------------------------------------------------------------------
@implementation CDVHoneywellScanner
@synthesize dataCallback = _dataCallback;

- (void)pluginInitialize {
    [super pluginInitialize];
    
    Captuvo* scanner = [Captuvo sharedCaptuvoDevice];
    [scanner startDecoderHardware];
    [scanner addCaptuvoDelegate:self];
}

- (void)dispose {
    Captuvo* scanner = [Captuvo sharedCaptuvoDevice];
    [scanner removeCaptuvoDelegate:self];
    [scanner stopDecoderHardware];

    [super dispose];
}

//--------------------------------------------------------------------------
// CaptuvoEventsProtocol methods
//--------------------------------------------------------------------------

- (void) decoderDataReceived:(NSString*)data {
    NSMutableDictionary* dict = [[NSMutableDictionary alloc] init];
    [dict setObject:data     forKey:@"data"];

    NSError* error = nil;
    NSData* jsonData = [NSJSONSerialization dataWithJSONObject:dict
                                                       options:NSJSONWritingPrettyPrinted
                                                         error:&error];

    if (error != nil) {
        NSLog(@"toJSONString error: %@", [error localizedDescription]);
    } else {
        NSString* jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        NSString* message = [NSString stringWithFormat:@"%@(%@);", self.dataCallback, jsonString];
        [self writeJavascript:message];
    }
}

//--------------------------------------------------------------------------
// Cordova methods
//--------------------------------------------------------------------------

- (void)registerCallback:(CDVInvokedUrlCommand*)command {
    self.dataCallback = [command.arguments objectAtIndex:0];
}

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

